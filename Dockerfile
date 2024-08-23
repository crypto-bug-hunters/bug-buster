# syntax=docker.io/docker/dockerfile:1

# This enforces that the packages downloaded from the repositories are the same
# for the defined date, no matter when the image is built.
ARG NOBLE_DATE=20240801
ARG APT_UPDATE_SNAPSHOT=${NOBLE_DATE}T030400Z

################################################################################
# cross base stage
FROM --platform=$BUILDPLATFORM ubuntu:noble-${NOBLE_DATE} AS base-build-stage

ARG APT_UPDATE_SNAPSHOT
ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt update
apt install -y --no-install-recommends ca-certificates
apt update --snapshot=${APT_UPDATE_SNAPSHOT}
EOF

################################################################################
# riscv64 base stage
FROM --platform=$TARGETPLATFORM ubuntu:noble-${NOBLE_DATE} AS base-target-stage

ARG APT_UPDATE_SNAPSHOT
ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt update
apt install -y --no-install-recommends ca-certificates
apt update --snapshot=${APT_UPDATE_SNAPSHOT}
EOF


################################################################################
# cross build stage
FROM base-build-stage AS build-stage

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    g++-riscv64-linux-gnu \
    wget
EOF

ARG GOVERSION=1.23.1

WORKDIR /opt/build

RUN wget https://go.dev/dl/go${GOVERSION}.linux-$(dpkg --print-architecture).tar.gz && \
    tar -C /usr/local -xzf go${GOVERSION}.linux-$(dpkg --print-architecture).tar.gz

ENV GOOS=linux
ENV GOARCH=riscv64
ENV CGO_ENABLED=1
ENV CC=riscv64-linux-gnu-gcc
ENV PATH=/usr/local/go/bin:${PATH}

COPY go.mod .
COPY go.sum .
RUN go mod download

COPY shared shared
COPY contract contract
RUN go build -o ./dapp ./contract

################################################################################
# riscv64 build stage
FROM base-target-stage AS riscv64-build-stage

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt install -y --no-install-recommends \
    lua5.4 \
    build-essential \
    ca-certificates \
    wget
EOF

WORKDIR /opt/build

# install bubblewrap (for sanboxing)
ARG BUBBLEWRAP_VER=0.8.0
RUN <<EOF
set -eu
apt-get install -y libseccomp-dev libcap-dev
wget -O bubblewrap-${BUBBLEWRAP_VER}.tar.xz https://github.com/containers/bubblewrap/releases/download/v${BUBBLEWRAP_VER}/bubblewrap-${BUBBLEWRAP_VER}.tar.xz
tar xf bubblewrap-${BUBBLEWRAP_VER}.tar.xz
mv bubblewrap-${BUBBLEWRAP_VER} bubblewrap
cd bubblewrap
./configure
make LDFLAGS=-static
EOF

# install bwrapbox (for sanboxing)
ARG BWRAPBOX_VER=0.2.2
COPY --chmod=466 bwrapbox/generate-rules.lua /tmp
RUN <<EOF
set -eu
wget -O bwrapbox-${BWRAPBOX_VER}.tar.gz https://github.com/edubart/bwrapbox/archive/refs/tags/v${BWRAPBOX_VER}.tar.gz
tar xf bwrapbox-${BWRAPBOX_VER}.tar.gz
mv bwrapbox-${BWRAPBOX_VER} bwrapbox
cd bwrapbox
cp /tmp/generate-rules.lua .
make generate-seccomp-rules seccomp-filter.bpf
make LDFLAGS=-static
EOF

################################################################################
# generate chiselled rootfs
FROM base-build-stage AS chiselled-rootfs
WORKDIR /rootfs

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /
RUN dpkg -x /machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /rootfs

# Get chisel binary
ARG CHISEL_VERSION=0.10.0
ADD "https://github.com/canonical/chisel/releases/download/v${CHISEL_VERSION}/chisel_v${CHISEL_VERSION}_linux_riscv64.tar.gz" chisel.tar.gz
RUN tar -xvf chisel.tar.gz -C /usr/bin/

ADD "https://github.com/cartesi/chisel-releases.git#24.04/bug-buster-dependencies" /chisel-24.04
RUN chisel cut \
    --release /chisel-24.04 \
    --root /rootfs \
    --arch=riscv64 \
    # base rootfs dependencies
    base-files_base \
    base-files_release-info \
    base-passwd_data \
    # machine-emulator-tools dependencies
    libgcc-s1_libs \
    busybox-static_bins \
    # bug-buster
    libasan6_libs \
    libasan8_libs \
    xz-utils_bins

RUN <<EOF
set -e
mkdir -p /rootfs/proc
mkdir -p /rootfs/sys
mkdir -p /rootfs/dev
ln -s /usr/bin/busybox bin/sh
sed -i '/^root/s/bash/sh/g' etc/passwd
EOF

################################################################################
# runtime stage: produces final image that will be executed
FROM scratch

LABEL io.cartesi.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=128Mi
LABEL io.cartesi.rollups.data_size=128Mb

COPY --from=riscv64-build-stage /opt/build/bubblewrap/bwrap /usr/bin/bwrap
COPY --from=riscv64-build-stage /opt/build/bwrapbox/bwrapbox /usr/bin/bwrapbox
COPY --from=riscv64-build-stage /opt/build/bwrapbox/seccomp-filter.bpf /usr/lib/bwrapbox/seccomp-filter.bpf

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=chiselled-rootfs /rootfs /
COPY --from=build-stage /opt/build/dapp .
COPY --chmod=755 skel/cartesi-init /usr/sbin/cartesi-init
COPY --chmod=755 skel/bounty-home /usr/sbin/cartesi-init.d/bounty-home
COPY --chmod=755 skel/bounty-run /usr/bin/bounty-run
COPY --chmod=644 tests/bounties/**/*-bounty_riscv64.tar.xz /bounties/examples

ENTRYPOINT ["rollup-init"]
CMD ["/opt/cartesi/dapp/dapp"]

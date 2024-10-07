# syntax=docker.io/docker/dockerfile:1

# This enforces that the packages downloaded from the repositories are the same
# for the defined date, no matter when the image is built.
ARG JAMMY_DATE=20240911.1
ARG APT_UPDATE_SNAPSHOT=${JAMMY_DATE}T030400Z

################################################################################
# cross base stage
FROM ubuntu:jammy-${JAMMY_DATE} AS base-build-stage

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
FROM --platform=linux/riscv64 ubuntu:jammy-${JAMMY_DATE} AS base-target-stage

ARG APT_UPDATE_SNAPSHOT
ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt update
apt install -y --no-install-recommends ca-certificates
apt update --snapshot=${APT_UPDATE_SNAPSHOT}
EOF

###############################################################################
# Python installation for onnxruntime

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt-get update
apt-get install -y --no-install-recommends \
  libatomic1 \
  libopenblas-dev \
  python3-full \
  python3-pip
EOF

COPY ./requirements.txt /bounties/requirements.txt

RUN pip install -r /bounties/requirements.txt --no-cache



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
# runtime stage: produces final image that will be executed
FROM base-target-stage

LABEL io.cartesi.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=1024Mi
LABEL io.cartesi.rollups.data_size=128Mb

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt-get install -y --no-install-recommends \
    busybox-static \
    libasan6 \
    libasan8 \
    xz-utils
rm -rf /var/lib/apt/lists/*
EOF

# install machine-emulator-tools
ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /tmp
RUN dpkg -i /tmp/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb \
  && rm /tmp/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb

COPY --from=riscv64-build-stage /opt/build/bubblewrap/bwrap /usr/bin/bwrap
COPY --from=riscv64-build-stage /opt/build/bwrapbox/bwrapbox /usr/bin/bwrapbox
COPY --from=riscv64-build-stage /opt/build/bwrapbox/seccomp-filter.bpf /usr/lib/bwrapbox/seccomp-filter.bpf

RUN useradd --home-dir /bounty bounty
RUN mkdir -p /bounties /bounties/examples /bounty
RUN chown bounty:bounty /bounty

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /opt/build/dapp .
COPY --chmod=755 skel/cartesi-init /usr/sbin/cartesi-init
COPY --chmod=755 skel/bounty-run /usr/bin/bounty-run
COPY --chmod=644 tests/bounties/**/*-bounty_riscv64.tar.xz /bounties/examples

###############################
# Setup gymnasium 
RUN pip install gymnasium --no-cache

ENTRYPOINT ["rollup-init"]
CMD ["/opt/cartesi/dapp/dapp"]

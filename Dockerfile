# syntax=docker.io/docker/dockerfile:1

# This enforces that the packages downloaded from the repositories are the same
# for the defined date, no matter when the image is built.
ARG UBUNTU_TAG=noble-20240827.1
ARG APT_UPDATE_SNAPSHOT=20240827T030400Z

# Built-in binaries version
ARG BUILTINS_VERSION=0.7.2

################################################################################
# cross base stage
FROM --platform=$BUILDPLATFORM ubuntu:${UBUNTU_TAG} AS base-build-stage

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
FROM ubuntu:${UBUNTU_TAG} AS base-target-stage

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
    curl \
    g++-riscv64-linux-gnu
EOF

ARG GOVERSION=1.23.1

WORKDIR /opt/build

RUN curl -L -R -O https://go.dev/dl/go${GOVERSION}.linux-$(dpkg --print-architecture).tar.gz && \
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
    curl
EOF

WORKDIR /opt/build

# install bubblewrap (for sanboxing)
ARG BUBBLEWRAP_VER=0.8.0
RUN <<EOF
set -eu
apt-get install -y libseccomp-dev libcap-dev
curl -L -R -O https://github.com/containers/bubblewrap/releases/download/v${BUBBLEWRAP_VER}/bubblewrap-${BUBBLEWRAP_VER}.tar.xz
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
curl -L -R -o bwrapbox-${BWRAPBOX_VER}.tar.gz https://github.com/edubart/bwrapbox/archive/refs/tags/v${BWRAPBOX_VER}.tar.gz
tar xf bwrapbox-${BWRAPBOX_VER}.tar.gz
mv bwrapbox-${BWRAPBOX_VER} bwrapbox
cd bwrapbox
cp /tmp/generate-rules.lua .
make generate-seccomp-rules seccomp-filter.bpf
make LDFLAGS=-static
EOF

################################################################################
# built-in binaries
FROM ghcr.io/crypto-bug-hunters/builtins:${BUILTINS_VERSION} AS builtins

################################################################################
# runtime stage: produces final image that will be executed
FROM base-target-stage

LABEL io.cartesi.sdk_name=cryptobughunters/sdk
LABEL io.cartesi.sdk_version=0.11.1
LABEL io.cartesi.rollups.ram_size=128Mi
LABEL io.cartesi.rollups.data_size=128Mb

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt-get install -y --no-install-recommends \
    busybox-static \
    libasan6 \
    libasan8 \
    libatomic1 \
    xz-utils
rm -rf /var/lib/apt/lists/*
EOF

# install machine-emulator-tools
ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ADD https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb /tmp
RUN dpkg -i /tmp/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb \
  && rm /tmp/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb

COPY --from=builtins --chmod=755 /opt/bundle/busybox-1.36.1-linux-riscv64 /usr/bin/busybox-1.36.1
COPY --from=builtins --chmod=755 /opt/bundle/forge-2cdbfac-linux-riscv64 /usr/bin/forge-2cdbfac
COPY --from=builtins --chmod=755 /opt/bundle/cast-2cdbfac-linux-riscv64 /usr/bin/cast-2cdbfac
COPY --from=builtins --chmod=755 /opt/bundle/lua-5.4.3-linux-riscv64 /usr/bin/lua-5.4.3
COPY --from=builtins --chmod=755 /opt/bundle/lua-5.4.7-linux-riscv64 /usr/bin/lua-5.4.7
COPY --from=builtins --chmod=755 /opt/bundle/reth-1.0.5-linux-riscv64 /usr/bin/reth-1.0.5
COPY --from=builtins --chmod=755 /opt/bundle/solc-0.8.27-linux-riscv64 /usr/bin/solc-0.8.27
COPY --from=builtins --chmod=755 /opt/bundle/sqlite-3.32.2-linux-riscv64 /usr/bin/sqlite-3.32.2
COPY --from=builtins --chmod=755 /opt/bundle/sqlite-3.43.2-linux-riscv64 /usr/bin/sqlite-3.43.2
COPY --from=riscv64-build-stage /opt/build/bubblewrap/bwrap /usr/bin/bwrap
COPY --from=riscv64-build-stage /opt/build/bwrapbox/bwrapbox /usr/bin/bwrapbox
COPY --from=riscv64-build-stage /opt/build/bwrapbox/seccomp-filter.bpf /usr/lib/bwrapbox/seccomp-filter.bpf

# install forge-std
ARG FORGE_STD_VERSION=1.9.3
ADD https://github.com/foundry-rs/forge-std.git#v${FORGE_STD_VERSION}:src /usr/share/forge-lib/forge-std/src

RUN useradd --home-dir /bounty bounty
RUN mkdir -p /bounties /bounty
RUN chown bounty:bounty /bounty

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /opt/build/dapp .
COPY --chmod=755 skel/cartesi-init /usr/sbin/cartesi-init
COPY --chmod=755 skel/bounty-run /usr/bin/bounty-run

ENTRYPOINT ["rollup-init"]
CMD ["/opt/cartesi/dapp/dapp"]

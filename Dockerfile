# syntax=docker.io/docker/dockerfile:1.4

################################################################################
# cross build stage
FROM ubuntu:noble-20240801 as build-stage

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt update
apt install -y --no-install-recommends \
    build-essential=12.10ubuntu1 \
    ca-certificates=20240203 \
    g++-riscv64-linux-gnu=4:13.2.0-7ubuntu1 \
    wget=1.21.4-1ubuntu4.1
EOF

ARG GOVERSION=1.23.0

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
FROM --platform=linux/riscv64 ubuntu:noble-20240801 as riscv64-build-stage

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -e
apt update
apt install -y --no-install-recommends \
    lua5.4=5.4.6-3build2 \
    build-essential=12.10ubuntu1 \
    ca-certificates=20240203 \
    wget=1.21.4-1ubuntu4.1
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
FROM --platform=linux/riscv64 ubuntu:noble-20240801

LABEL io.cartesi.sdk_version=0.9.0
LABEL io.cartesi.rollups.ram_size=128Mi
LABEL io.cartesi.rollups.data_size=128Mb

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.14.1
ARG MACHINE_EMULATOR_TOOLS_DEB=machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.deb
ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt-get update
apt-get install -y --no-install-recommends \
    busybox-static=1:1.36.1-6ubuntu3.1 \
    ca-certificates=20240203 \
    curl=8.5.0-2ubuntu10.3 \
    libasan6=11.4.0-9ubuntu1 \
    libasan8=14-20240412-0ubuntu1 \
    xz-utils=5.6.1+really5.4.5-1build0.1
curl -o ${MACHINE_EMULATOR_TOOLS_DEB} -fsSL https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/${MACHINE_EMULATOR_TOOLS_DEB}
dpkg -i ${MACHINE_EMULATOR_TOOLS_DEB}
rm ${MACHINE_EMULATOR_TOOLS_DEB}
rm -rf /var/lib/apt/lists/*
EOF

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

ENTRYPOINT ["rollup-init"]
CMD ["/opt/cartesi/dapp/dapp"]

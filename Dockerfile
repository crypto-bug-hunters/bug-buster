# syntax=docker.io/docker/dockerfile:1.4

################################################################################
# cross build stage
FROM ubuntu:22.04 as build-stage

RUN <<EOF
apt update
apt upgrade -y
apt install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    g++-riscv64-linux-gnu \
    wget
EOF

ARG GOVERSION=1.21.1

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
FROM --platform=linux/riscv64 riscv64/ubuntu:22.04 as riscv64-build-stage

RUN <<EOF
apt update
apt upgrade -y
apt install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    wget
EOF

WORKDIR /opt/build

# install bubblewrap (for sanboxing)
ARG BUBBLEWRAP_VER=0.8.0
RUN <<EOF
apt-get install -y libseccomp-dev libcap-dev
wget -O bubblewrap-${BUBBLEWRAP_VER}.tar.xz https://github.com/containers/bubblewrap/releases/download/v${BUBBLEWRAP_VER}/bubblewrap-${BUBBLEWRAP_VER}.tar.xz
tar xf bubblewrap-${BUBBLEWRAP_VER}.tar.xz
mv bubblewrap-${BUBBLEWRAP_VER} bubblewrap
cd bubblewrap
./configure
make LDFLAGS=-static
EOF

# install bwrapbox (for sanboxing)
ARG BWRAPBOX_VER=0.2.0
RUN <<EOF
wget -O bwrapbox-${BWRAPBOX_VER}.tar.gz https://github.com/edubart/bwrapbox/archive/refs/tags/v${BWRAPBOX_VER}.tar.gz
tar xf bwrapbox-${BWRAPBOX_VER}.tar.gz
mv bwrapbox-${BWRAPBOX_VER} bwrapbox
cd bwrapbox
make LDFLAGS=-static
EOF

################################################################################
# runtime stage: produces final image that will be executed
FROM --platform=linux/riscv64 riscv64/ubuntu:22.04

LABEL io.sunodo.sdk_version=0.2.0-sandboxing
LABEL io.cartesi.rollups.ram_size=128Mi
LABEL io.cartesi.rollups.data_size=128Mb

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.12.0
RUN <<EOF
apt-get update
apt-get upgrade -y
apt-get install -y --no-install-recommends busybox-static ca-certificates curl xz-utils libasan8 libasan6
curl -fsSL https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz \
  | tar -C / --overwrite -xvzf -
rm -rf /var/lib/apt/lists/*
EOF

COPY --from=riscv64-build-stage /opt/build/bubblewrap/bwrap /usr/bin/bwrap
COPY --from=riscv64-build-stage /opt/build/bwrapbox/bwrapbox /usr/bin/bwrapbox
COPY --from=riscv64-build-stage /opt/build/bwrapbox/seccomp-filter.bpf /usr/lib/bwrapbox/seccomp-filter.bpf

RUN useradd --home-dir /bounty bounty
RUN mkdir -p /bounties /bounty
RUN chown bounty:bounty /bounty

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /opt/build/dapp .
COPY --chmod=755 skel/init /opt/cartesi/bin/init
COPY --chmod=755 skel/bounty-run /usr/bin/bounty-run

ENTRYPOINT ["rollup-init"]
CMD ["/opt/cartesi/dapp/dapp"]

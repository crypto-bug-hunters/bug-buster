################################################################################
# cross build stage
FROM ubuntu:22.04 as builder
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    crossbuild-essential-riscv64 \
    git \
    make \
    wget \
    xz-utils
ARG GOVERSION=1.22.2

WORKDIR /opt/build
RUN wget https://go.dev/dl/go${GOVERSION}.linux-$(dpkg --print-architecture).tar.gz && \
    tar -C /usr/local -xzf go${GOVERSION}.linux-$(dpkg --print-architecture).tar.gz

ENV GOOS=linux
ENV GOARCH=riscv64
ENV CGO_ENABLED=1
ENV CC=riscv64-linux-gnu-gcc
ENV PATH=/usr/local/go/bin:${PATH}

COPY Makefile .
ARG VERSION
COPY --chmod=755 start.sh .
RUN make ARCH=riscv64 VERSION=${VERSION}

################################################################################
FROM --platform=linux/riscv64 riscv64/ubuntu:22.04
ARG VERSION
COPY --from=builder /opt/build/celestia-node-${VERSION}-bounty_riscv64.tar.xz /root/

FROM --platform=linux/riscv64 riscv64/ubuntu:22.04
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y --no-install-recommends ca-certificates build-essential wget xz-utils
WORKDIR /root
COPY Makefile .
COPY bounty.lua .
COPY --chmod=755 start.sh .
ARG VERSION
RUN make download VERSION=${VERSION}
RUN make -j4 VERSION=${VERSION}

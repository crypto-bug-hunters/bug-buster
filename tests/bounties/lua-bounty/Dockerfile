# FROM --platform=linux/riscv64 alpine:edge
# RUN apk update && apk upgrade
# RUN apk add gcc g++ libc-dev make wget tar xz

FROM --platform=linux/riscv64 riscv64/ubuntu:22.04
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y --no-install-recommends ca-certificates build-essential wget xz-utils
WORKDIR /root
COPY Makefile .
COPY bounty.lua .
COPY --chmod=755 start.sh .
ARG LUA_VER=5.4.3
RUN make download LUA_VER=${LUA_VER}
RUN make -j4 LUA_VER=${LUA_VER}

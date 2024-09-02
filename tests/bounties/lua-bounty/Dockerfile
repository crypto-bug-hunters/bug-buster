FROM --platform=linux/riscv64 ubuntu:noble-20240801
RUN apt-get install -y --update --no-install-recommends \
  build-essential=12.10ubuntu1 \
  ca-certificates=20240203 \
  wget=1.21.4-1ubuntu4.1 \
  xz-utils=5.6.1+really5.4.5-1build0.1
WORKDIR /root
COPY Makefile .
COPY bounty.lua .
COPY --chmod=755 start.sh .
ARG VERSION
RUN make download VERSION=${VERSION}
RUN make -j4 VERSION=${VERSION}

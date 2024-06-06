################################################################################
# cross build stage
FROM cartesi/toolchain as builder
ARG VERSION
ARG TARGET=target/
ARG CARGO_BUILD_TARGET

WORKDIR /opt/build

COPY Makefile .
COPY --chmod=755 start.sh .
RUN make ARCH=riscv64 TARGET=${TARGET} VERSION=${VERSION}

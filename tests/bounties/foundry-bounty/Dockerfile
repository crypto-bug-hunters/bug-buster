################################################################################
# cross build stage
FROM rust-env:latest AS rust-builder

FROM rust-builder AS forge-builder
ARG VERSION
ARG TARGET=target/
ARG CARGO_BUILD_TARGET

WORKDIR /opt/build

COPY Makefile .
COPY --chmod=755 start.sh .
RUN make ARCH=riscv64 TARGET=${TARGET} VERSION=${VERSION}

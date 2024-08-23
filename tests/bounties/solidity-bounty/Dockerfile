FROM ubuntu:24.04 as base-builder
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    crossbuild-essential-riscv64 \
    git \
    make \
    wget \
    xz-utils

#
# Build Boost
#

FROM base-builder as boost-builder
WORKDIR /opt/build
RUN wget "https://boostorg.jfrog.io/artifactory/main/release/1.74.0/source/boost_1_74_0.tar.gz"
RUN tar xzf boost_1_74_0.tar.gz
WORKDIR /opt/build/boost_1_74_0
RUN mkdir -p /opt/boost
RUN ./bootstrap.sh --prefix=/opt/boost
RUN echo "using gcc : riscv64 : riscv64-linux-gnu-g++ ;" > "${HOME}/user-config.jam"
RUN ./b2 toolset=gcc-riscv64 headers
RUN ./b2 toolset=gcc-riscv64 link=static variant=release runtime-link=static \
    --with-system --with-filesystem --with-test --with-program_options \
    install -j `nproc`

#
# Build Solidity
#

FROM base-builder as solidity-builder
WORKDIR /opt/build
RUN apt-get install -y --no-install-recommends cmake
ARG VERSION
RUN wget -O solidity-${VERSION}.tar.gz https://github.com/ethereum/solidity/releases/download/v${VERSION}/solidity_${VERSION}.tar.gz
RUN tar xzf solidity-${VERSION}.tar.gz
COPY --from=boost-builder /opt/boost /opt/boost
RUN cmake \
    -S solidity_${VERSION} \
    -B solidity_${VERSION}/build \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_SYSTEM_NAME=Linux \
    -DCMAKE_C_COMPILER=riscv64-linux-gnu-gcc \
    -DCMAKE_CXX_COMPILER=riscv64-linux-gnu-g++ \
    -DBoost_INCLUDE_DIR=/opt/boost \
    -DBoost_USE_STATIC_RUNTIME=ON \
    -DUSE_CVC4=OFF \
    -DUSE_Z3=OFF \
    -DTESTS=OFF

RUN make -C solidity_${VERSION}/build solc

#
# Create the .tar.xz file
#

RUN mv solidity_${VERSION}/build/solc/solc .
COPY --chmod=755 start.sh .
RUN tar cfJ /root/solidity-${VERSION}-bounty_riscv64.tar.xz solc start.sh

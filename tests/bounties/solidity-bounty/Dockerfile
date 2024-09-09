FROM ubuntu:noble-20240801 as base-builder
RUN apt-get install -y --update --no-install-recommends \
    build-essential=12.10ubuntu1 \
    ca-certificates=20240203 \
    crossbuild-essential-riscv64=12.10ubuntu1 \
    git=1:2.43.0-1ubuntu7.1 \
    make=4.3-4.1build2 \
    wget=1.21.4-1ubuntu4.1 \
    xz-utils=5.6.1+really5.4.5-1build0.1

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
RUN apt-get install -y --no-install-recommends cmake=3.28.3-1build7
ARG VERSION
RUN wget -O solidity-${VERSION}.tar.gz https://github.com/ethereum/solidity/releases/download/v${VERSION}/solidity_${VERSION}.tar.gz
RUN tar xzf solidity-${VERSION}.tar.gz
COPY --from=boost-builder /opt/boost /opt/boost
ENV CFLAGS="-O1 -ftrivial-auto-var-init=pattern -D_FORTIFY_SOURCE=2 -fPIE -fstack-clash-protection -fstack-protector-strong -ffunction-sections -fdata-sections -Wno-unused-result"
ENV CXXFLAGS=$CFLAGS
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
RUN tar \
    --sort=name \
    --mtime=@0 \
    --owner=0 \
    --group=0 \
    --numeric-owner \
    --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime \
    -cJf /root/solidity-${VERSION}-bounty_riscv64.tar.xz solc start.sh

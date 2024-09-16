FROM cryptobughunters/sdk:0.11.1

ARG DEBIAN_FRONTEND=noninteractive
RUN <<EOF
set -eu
apt update
apt-get install -y --no-install-recommends \
    build-essential \
    git \
    liblua5.4-dev \
    luarocks
EOF

RUN <<EOF
set -eu
luarocks install --lua-version=5.4 cartesix
luarocks install --lua-version=5.4 lester
luarocks install --lua-version=5.4 lua-cjson
luarocks install --lua-version=5.4 luazen
EOF

FROM cryptobughunters/sdk:0.11.1

RUN apt-get update
RUN apt-get install -y \
  build-essential=12.9 \
  git=1:2.39.2-1.1 \
  liblua5.4-dev=5.4.4-3+deb12u1 \
  luarocks=3.8.0+dfsg1-1
RUN <<EOF
luarocks install --lua-version=5.4 cartesix
luarocks install --lua-version=5.4 lester
luarocks install --lua-version=5.4 lua-cjson
luarocks install --lua-version=5.4 luazen
EOF

FROM cartesi/sdk:0.9.0

RUN apt-get update
RUN apt-get install -y build-essential luarocks lua5.4-dev git
RUN <<EOF
luarocks install --lua-version=5.4 cartesix
luarocks install --lua-version=5.4 lester
luarocks install --lua-version=5.4 lua-cjson
luarocks install --lua-version=5.4 luazen
EOF

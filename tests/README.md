# Tests

## Install dependencies

First make sure you have installed:
- Lua 5.4.x
- LuaRocks 3.x
- Cartesi Machine Emulator 0.15.2

Note that in case you compiled Cartesi Machine locally, make sure:
- `cartesi.so` is visible in `LUA_CPATH_5_4`
- `libcartesi.so` is visible in `LD_LIBRARY_PATH`
- `jsonrpc-remote-cartesi-machine` is visible in `PATH`
This is not needed in cause you made a system wide Cartesi Machine installation (e.g in `/usr`)

You can quickly install Cartesi Machine with:
```sh
apt-get install -y build-essential git pkg-config lua5.4 liblua5.4-dev wget libboost-dev libboost-context-dev libboost-coroutine-dev libboost-filesystem-dev libcrypto++-dev libb64-dev nlohmann-json3-dev libprotobuf-dev protobuf-compiler-grpc libgrpc++-dev libb64-dev libabsl-dev patchelf
git clone --recursive --branch v0.15.2 https://github.com/cartesi/machine-emulator.git
cd machine-emulator
make dep
make
sudo make install PREFIX=/usr/local
```

Then install required LuaRocks packages:

```sh
# Lua library with cartesi machine extensions
sudo luarocks install --lua-version=5.4 cartesix

# Lua library for unit testing
sudo luarocks install --lua-version=5.4 lester

# Lua library for encoding JSON
sudo luarocks install --lua-version=5.4 cjson

# Lua library for encoding base64
sudo luarocks install --lua-version=5.4 luazen

# Lua library for handling 256-bit integers
sudo luarocks install --lua-version=5.4 bint
```

## Compile bounties

Before testing, you need to compile bounties binaries.

```sh
make -C bounties
```

## Test

First make sure to run `sunodo build` to generate the backend image.
Then inside `tests` directory, just do:

```sh
lua5.4 tests.lua
```

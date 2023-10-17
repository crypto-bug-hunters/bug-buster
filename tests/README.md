# Tests

## Install dependencies

First make sure you have installed:
- Lua 5.4.x
- LuaRocks 3.x
- Cartesi Machine Emulator 0.15.2

Note that in case you compiled Cartesi Machine locally,
`cartesi.so` must be visible in `LUA_CPATH_5_4`
and `libcartesi.so` must be visible in `LD_LIBRARY_PATH`,
unless you made a system wide cartesi machine installation.

```sh
# Lua library for with cartesi machine extensions
sudo luarocks install --lua-version=5.4 cartesix

# Lua library for unit testing
sudo luarocks install --lua-version=5.4 lester

# Lua library for encoding JSON
sudo luarocks install --lua-version=5.4 cjson

# Lua library for encoding base64
sudo luarocks install --lua-version=5.4 base64

# Lua library for handling 256-bit integers
sudo luarocks install --lua-version=5.4 bint
```

## Test

First make sure to run `sunodo build` to generate the backend image.
Then inside `tests` directory, just do:

```sh
lua5.4 tests.lua
```

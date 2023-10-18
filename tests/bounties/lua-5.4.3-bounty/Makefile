LUA_VER=5.4.3
LUA_TAR=lua-$(LUA_VER).tar.gz
LUA_DIR=lua-$(LUA_VER)
ARCH=$(shell uname -m)
BOUNTY_TAR=$(LUA_DIR)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=$(LUA_DIR)-bounty_riscv64.tar.xz

HARDENCFLAGS=-fexceptions -fPIE -pie -D_FORTIFY_SOURCE=2 -fstack-clash-protection -fstack-protector-strong
HARDENLDFLAGS=-pie -Wl,-z,now,-z,relro

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: $(LUA_DIR)

$(BOUNTY_TAR): lua start.sh bounty.lua
	tar cfJ $@ $^

lua: $(LUA_DIR)
	$(MAKE) -C $(LUA_DIR)/src MYCFLAGS="$(HARDENCFLAGS) $(MYCFLAGS)" MYLDFLAGS="$(HARDENLDFLAGS) $(HARDENLDFLAGS)" linux
	cp $(LUA_DIR)/src/lua lua
	strip lua

$(LUA_DIR): $(LUA_TAR)
	tar xzf $(LUA_TAR)

$(LUA_TAR):
	wget -O $(LUA_TAR) https://www.lua.org/ftp/$(LUA_TAR)

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh bounty.lua
	docker build --tag lua-bounty-cp --file Dockerfile --progress plain .
	docker create --platform=linux/riscv64 --name lua-bounty-cp lua-bounty-cp
	docker cp lua-bounty-cp:/root/$@ $@
	docker rm lua-bounty-cp
	touch $@
endif

clean: $(LUA_DIR)
	rm -f lua $(LUA_DIR)-bounty_*.tar.xz
	$(MAKE) -C $(LUA_DIR) clean

distclean: clean
	rm -rf lua-*

test-exploit:
	./start.sh exploit.lua

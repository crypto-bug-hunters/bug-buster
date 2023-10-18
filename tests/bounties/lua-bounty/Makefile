ARCH=$(shell uname -m)
LUA_VER=5.4.3
LUA_TAR=lua-$(LUA_VER).tar.gz
LUA_DIR=lua-$(LUA_VER)
BOUNTY_TAR=lua-$(LUA_VER)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=lua-$(LUA_VER)-bounty_riscv64.tar.xz

HARDEN_CFLAGS=-fexceptions -fPIE -pie -D_FORTIFY_SOURCE=2 -fstack-clash-protection -fstack-protector-strong
HARDEN_LDFLAGS=-pie -Wl,-z,now,-z,relro

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: $(LUA_DIR)

$(BOUNTY_TAR): lua start.sh bounty.lua
	tar cfJ $@ $^

$(LUA_DIR)/src/lua: $(LUA_DIR)
	$(MAKE) -C $(LUA_DIR)/src MYCFLAGS="$(HARDEN_CFLAGS) $(MYCFLAGS)" MYLDFLAGS="$(HARDEN_LDFLAGS) $(HARDEN_LDFLAGS)" linux

lua: $(LUA_DIR)/src/lua
	cp $(LUA_DIR)/src/lua lua
	strip lua

$(LUA_DIR): $(LUA_TAR)
	tar xzf $(LUA_TAR)

$(LUA_TAR):
	wget -O $(LUA_TAR) https://www.lua.org/ftp/$(LUA_TAR)

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh bounty.lua
	docker build --tag lua-bounty-cp --file Dockerfile --progress plain --build-arg LUA_VER=$(LUA_VER) .
	docker create --platform=linux/riscv64 --name lua-bounty-cp lua-bounty-cp
	docker cp lua-bounty-cp:/root/$@ $@
	docker rm lua-bounty-cp
	touch $@
endif

clean:
	rm -f lua $(LUA_DIR)-bounty_*.tar.xz
	if [ -d "$(LUA_DIR)" ]; then $(MAKE) -C $(LUA_DIR) clean; fi

distclean: clean
	rm -rf lua-*

test-exploit:
	./start.sh exploit-lua-$(LUA_VER).lua

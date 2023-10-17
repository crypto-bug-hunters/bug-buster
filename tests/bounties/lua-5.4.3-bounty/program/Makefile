LUA_VER=5.4.3
LUA_TAR=lua-$(LUA_VER).tar.gz
LUA_DIR=lua-$(LUA_VER)
LUA=lua

all: lua

lua: $(LUA_DIR)
	$(MAKE) -C $(LUA_DIR)/src MYCFLAGS="-fPIC" linux
	cp $(LUA_DIR)/src/lua lua
	strip lua

$(LUA_DIR): $(LUA_TAR)
	tar xzf $(LUA_TAR)

$(LUA_TAR):
	wget -O $(LUA_TAR) https://www.lua.org/ftp/$(LUA_TAR)

clean: $(LUA_DIR)
	$(MAKE) -C $(LUA_DIR) clean

distclean:
	rm -rf lua lua-*

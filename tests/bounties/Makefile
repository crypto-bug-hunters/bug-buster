ALIAS_TEMPLATE=shopt -s expand_aliases\nalias %s='%s-%s'\n

.PHONY: all
all:

all: dist/lua-5.4.3-bounty.tar.xz

dist/lua-5.4.3-bounty.tar.xz: build/lua/5.4.3/aliases.sh src/lua/start.sh src/lua/bounty.lua | dist
	tar -cJf $@ -C build/lua/5.4.3 aliases.sh -C ../../../src/lua start.sh bounty.lua

build/lua/5.4.3/aliases.sh: | build/lua/5.4.3
	printf "$(ALIAS_TEMPLATE)" lua lua 5.4.3 > $@

build/lua/5.4.3:
	mkdir -p $@

all: dist/lua-5.4.7-bounty.tar.xz

dist/lua-5.4.7-bounty.tar.xz: build/lua/5.4.7/aliases.sh src/lua/start.sh src/lua/bounty.lua | dist
	tar -cJf $@ -C build/lua/5.4.7 aliases.sh -C ../../../src/lua start.sh bounty.lua

build/lua/5.4.7/aliases.sh: | build/lua/5.4.7
	printf "$(ALIAS_TEMPLATE)" lua lua 5.4.7 > $@

build/lua/5.4.7:
	mkdir -p $@

all: dist/sqlite-3.32.2-bounty.tar.xz

dist/sqlite-3.32.2-bounty.tar.xz: build/sqlite/3.32.2/aliases.sh src/sqlite/start.sh | dist
	tar -cJf $@ -C build/sqlite/3.32.2 aliases.sh -C ../../../src/sqlite start.sh

build/sqlite/3.32.2/aliases.sh: | build/sqlite/3.32.2
	printf "$(ALIAS_TEMPLATE)" sqlite3 sqlite 3.32.2 > $@

build/sqlite/3.32.2:
	mkdir -p $@

all: dist/sqlite-3.43.2-bounty.tar.xz

dist/sqlite-3.43.2-bounty.tar.xz: build/sqlite/3.43.2/aliases.sh src/sqlite/start.sh | dist
	tar -cJf $@ -C build/sqlite/3.43.2 aliases.sh -C ../../../src/sqlite start.sh

build/sqlite/3.43.2/aliases.sh: | build/sqlite/3.43.2
	printf "$(ALIAS_TEMPLATE)" sqlite3 sqlite 3.43.2 > $@

build/sqlite/3.43.2:
	mkdir -p $@

all: dist/busybox-1.36.1-bounty.tar.xz

dist/busybox-1.36.1-bounty.tar.xz: build/busybox/1.36.1/aliases.sh src/busybox/start.sh | dist
	tar -cJf $@ -C build/busybox/1.36.1 aliases.sh -C ../../../src/busybox start.sh

build/busybox/1.36.1/aliases.sh: | build/busybox/1.36.1
	printf "$(ALIAS_TEMPLATE)" busybox busybox 1.36.1 > $@

build/busybox/1.36.1:
	mkdir -p $@

all: dist/solc-0.8.27-bounty.tar.xz

dist/solc-0.8.27-bounty.tar.xz: build/solc/0.8.27/aliases.sh src/solc/start.sh | dist
	tar -cJf $@ -C build/solc/0.8.27 aliases.sh -C ../../../src/solc start.sh

build/solc/0.8.27/aliases.sh: | build/solc/0.8.27
	printf "$(ALIAS_TEMPLATE)" solc solc 0.8.27 > $@

build/solc/0.8.27:
	mkdir -p $@

dist:
	mkdir -p $@

.PHONY: clean
clean:
	rm -rf build

.PHONY: distclean
distclean: clean
	rm -rf dist

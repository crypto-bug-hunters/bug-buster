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

all: dist/safe-adder-bounty.tar.xz

dist/safe-adder-bounty.tar.xz: build/adder/aliases.sh build/safe-adder/script/Deploy.s.sol \
		src/adder/start.sh src/adder/foundry.toml src/adder/src/IAdder.sol src/adder/src/SafeAdder.sol \
		src/adder/script/LibDeployments.sol src/adder/script/Test.s.sol | dist
	tar -cJf $@ -C build/adder aliases.sh -C ../safe-adder script/Deploy.s.sol \
		-C ../../src/adder start.sh foundry.toml src/IAdder.sol src/SafeAdder.sol \
		script/LibDeployments.sol script/Test.s.sol

build/safe-adder/script/Deploy.s.sol: | build/safe-adder/script
	cp src/adder/script/DeploySafe.s.sol $@

build/safe-adder/script:
	mkdir -p $@

all: dist/unsafe-adder-bounty.tar.xz

dist/unsafe-adder-bounty.tar.xz: build/adder/aliases.sh build/unsafe-adder/script/Deploy.s.sol \
		src/adder/start.sh src/adder/foundry.toml src/adder/src/IAdder.sol src/adder/src/UnsafeAdder.sol \
		src/adder/script/LibDeployments.sol src/adder/script/Test.s.sol | dist
	tar -cJf $@ -C build/adder aliases.sh -C ../unsafe-adder script/Deploy.s.sol \
		-C ../../src/adder start.sh foundry.toml src/IAdder.sol src/UnsafeAdder.sol \
		script/LibDeployments.sol script/Test.s.sol

build/unsafe-adder/script/Deploy.s.sol: | build/unsafe-adder/script
	cp src/adder/script/DeployUnsafe.s.sol $@

build/unsafe-adder/script:
	mkdir -p $@

build/adder/aliases.sh: | build/adder
	printf "$(ALIAS_TEMPLATE)" forge forge 2cdbfac > $@
	printf "$(ALIAS_TEMPLATE)" reth reth 1.0.5 >> $@
	printf "$(ALIAS_TEMPLATE)" solc solc 0.8.27 >> $@

build/adder:
	mkdir -p $@

dist:
	mkdir -p $@

.PHONY: clean
clean:
	rm -rf build

.PHONY: distclean
distclean: clean
	rm -rf dist

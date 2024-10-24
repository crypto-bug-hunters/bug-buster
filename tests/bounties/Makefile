ALIAS_TEMPLATE= shopt -s expand_aliases\nalias %s='%s-%s'\n
TAR_OPTS= --transform='s,/*[^/]*/[^/]*/,,' --sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime -cJf

.PHONY: all
all:

.PHONY: clean
clean:
	rm -rf build

.PHONY: distclean
distclean: clean
	rm -rf dist

###################
# Lua
###################

LUA_VERSIONS= 5.4.3 5.4.7

all: $(patsubst %,dist/lua-%-bounty.tar.xz,$(LUA_VERSIONS))

dist/lua-%-bounty.tar.xz: build/lua-%-bounty/aliases.sh src/lua/start.sh src/lua/bounty.lua
	mkdir -p $(@D)
	tar $(TAR_OPTS) $@ $^

build/lua-%-bounty/aliases.sh:
	mkdir -p $(@D)
	printf "$(ALIAS_TEMPLATE)" lua lua $* > $@

###################
# SQLite
###################

SQLITE_VERSIONS= 3.32.2 3.43.2

all: $(patsubst %,dist/sqlite-%-bounty.tar.xz,$(SQLITE_VERSIONS))

dist/sqlite-%-bounty.tar.xz: build/sqlite-%-bounty/aliases.sh src/sqlite/start.sh
	mkdir -p $(@D)
	tar $(TAR_OPTS) $@ $^

build/sqlite-%-bounty/aliases.sh:
	mkdir -p $(@D)
	printf "$(ALIAS_TEMPLATE)" sqlite3 sqlite $* > $@

###################
# BusyBox
###################

BUSYBOX_VERSIONS= 1.36.1

all: $(patsubst %,dist/busybox-%-bounty.tar.xz,$(BUSYBOX_VERSIONS))

dist/busybox-%-bounty.tar.xz: build/busybox-%-bounty/aliases.sh src/busybox/start.sh
	mkdir -p $(@D)
	tar $(TAR_OPTS) $@ $^

build/busybox-%-bounty/aliases.sh:
	mkdir -p $(@D)
	printf "$(ALIAS_TEMPLATE)" busybox busybox $* > $@

###################
# Solidity
###################

SOLC_VERSIONS= 0.8.27

all: $(patsubst %,dist/solc-%-bounty.tar.xz,$(SOLC_VERSIONS))

dist/solc-%-bounty.tar.xz: build/solc-%-bounty/aliases.sh src/solc/start.sh
	mkdir -p $(@D)
	tar $(TAR_OPTS) $@ $^

build/solc-%-bounty/aliases.sh:
	mkdir -p $(@D)
	printf "$(ALIAS_TEMPLATE)" solc solc $* > $@

###################
# Adder contract
###################

ADDER_VERSIONS= safe unsafe

all: $(patsubst %,dist/adder-%-bounty.tar.xz,$(ADDER_VERSIONS))

dist/adder-%-bounty.tar.xz: \
		build/adder-%-bounty/script/Deploy.s.sol \
		src/adder/start.sh \
		src/adder/foundry.toml \
		src/adder/src/IAdder.sol \
		src/adder/src/%/Adder.sol \
		src/adder/script/LibDeployments.sol \
		src/adder/script/Test.s.sol
	tar $(TAR_OPTS) $@ $^

build/adder-%-bounty/script/Deploy.s.sol: src/adder/script/%/Deploy.s.sol
	mkdir -p $(@D)
	cp $< $@

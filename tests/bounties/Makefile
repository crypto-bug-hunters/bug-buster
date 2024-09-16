PROGRAM=
ALIAS=$(PROGRAM)
EXTRAFILES=
FILES=start.sh $(EXTRAFILES)

SOURCE_DIR=src
BUILD_DIR=build
DIST_DIR=dist

BOUNTY_SOURCE_DIR=$(SOURCE_DIR)/$(PROGRAM)
BOUNTY_BUILD_DIR=$(BUILD_DIR)/$(PROGRAM)/$(VERSION)
BOUNTY_ALIAS_FILE=$(BOUNTY_BUILD_DIR)/aliases.sh

BOUNTY_TAR=$(DIST_DIR)/$(PROGRAM)-$(VERSION)-bounty.tar.xz

all:
	$(MAKE) lua-bounty VERSION=5.4.3
	$(MAKE) lua-bounty VERSION=5.4.7
	$(MAKE) sqlite-bounty VERSION=3.32.2
	$(MAKE) sqlite-bounty VERSION=3.43.2
	$(MAKE) busybox-bounty VERSION=1.36.1
	$(MAKE) solc-bounty VERSION=0.8.27

lua-bounty:
	$(MAKE) bounty PROGRAM=lua EXTRAFILES=bounty.lua

sqlite-bounty:
	$(MAKE) bounty PROGRAM=sqlite ALIAS=sqlite3

busybox-bounty:
	$(MAKE) bounty PROGRAM=busybox

solc-bounty:
	$(MAKE) bounty PROGRAM=solc

bounty: $(BOUNTY_TAR)

$(BOUNTY_TAR): $(patsubst %,$(BOUNTY_SOURCE_DIR)/%,$(FILES)) $(BOUNTY_ALIAS_FILE) | $(DIST_DIR)
	tar -cJf $@ \
		--sort=name \
		--mtime=@0 \
		--owner=0 --group=0 --numeric-owner \
		--pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime \
		-C $(shell pwd)/$(BOUNTY_SOURCE_DIR) $(FILES) \
		-C $(shell pwd)/$(BOUNTY_BUILD_DIR) aliases.sh

$(DIST_DIR):
	mkdir -p $@

$(BOUNTY_ALIAS_FILE): | $(BOUNTY_BUILD_DIR)
	echo "shopt -s expand_aliases" > $@
	echo "alias $(ALIAS)='$(PROGRAM)-$(VERSION)'" >> $@

$(BOUNTY_BUILD_DIR):
	mkdir -p $@

clean:
	rm -rf $(BUILD_DIR)

distclean: clean
	rm -rf $(DIST_DIR)

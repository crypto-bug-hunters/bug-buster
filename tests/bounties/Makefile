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
	$(MAKE) bounty PROGRAM=lua EXTRAFILES=bounty.lua VERSION=5.4.3
	$(MAKE) bounty PROGRAM=lua EXTRAFILES=bounty.lua VERSION=5.4.7
	$(MAKE) bounty PROGRAM=sqlite ALIAS=sqlite3 VERSION=3.32.2
	$(MAKE) bounty PROGRAM=sqlite ALIAS=sqlite3 VERSION=3.43.2
	$(MAKE) bounty PROGRAM=busybox VERSION=1.36.1
	$(MAKE) bounty PROGRAM=solc VERSION=0.8.27

bounty: $(BOUNTY_TAR)

$(BOUNTY_TAR): $(patsubst %,$(BOUNTY_SOURCE_DIR)/%,$(FILES)) $(BOUNTY_ALIAS_FILE) | $(DIST_DIR)
	tar -cJf $@ -C $(shell pwd)/$(BOUNTY_SOURCE_DIR) $(FILES) -C $(shell pwd)/$(BOUNTY_BUILD_DIR) aliases.sh

$(DIST_DIR):
	mkdir -p $@

$(BOUNTY_ALIAS_FILE): | $(BOUNTY_BUILD_DIR)
	echo "alias $(ALIAS)='$(PROGRAM)-$(VERSION)'" > $@

$(BOUNTY_BUILD_DIR):
	mkdir -p $@

clean:
	rm -rf $(BUILD_DIR)

distclean: clean
	rm -rf $(DIST_DIR)

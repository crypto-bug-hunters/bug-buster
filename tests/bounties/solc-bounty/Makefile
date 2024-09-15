PROGRAM=solc
ALIAS=$(PROGRAM)
TMP_DIR=tmp
BOUNTY_DIR=$(TMP_DIR)/$(VERSION)
BOUNTY_TAR=$(PROGRAM)-$(VERSION)-bounty.tar.xz

FILES=start.sh

bounty: $(BOUNTY_TAR)

$(BOUNTY_TAR): $(FILES) $(BOUNTY_DIR)/aliases.sh
	tar -cJf $@ $(FILES) -C $(BOUNTY_DIR) aliases.sh

$(BOUNTY_DIR)/aliases.sh: | $(BOUNTY_DIR)
	echo "alias $(ALIAS)='$(PROGRAM)-$(VERSION)'" > $@

$(BOUNTY_DIR):
	mkdir -p $@

clean:
	rm -rf $(TMP_DIR)

distclean: clean
	rm -f $(PROGRAM)-*-bounty.tar.xz

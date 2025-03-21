ARCH=$(shell uname -m)
VERSION=0.13.5
SOURCE_TAR=celestia-node-$(VERSION).tar.gz
SOURCE_DIR=celestia-node-$(VERSION)
BUILD_DIR=$(SOURCE_DIR)/build
BOUNTY_TAR=celestia-node-$(VERSION)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=celestia-node-$(VERSION)-bounty_riscv64.tar.xz

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: | $(SOURCE_DIR)

$(BOUNTY_TAR): celestia start.sh
	tar cfJ $@ $^

$(BUILD_DIR):
	mkdir -p $@

$(BUILD_DIR)/celestia: | $(SOURCE_DIR) $(BUILD_DIR)
	$(MAKE) -C $(SOURCE_DIR) build

celestia: $(BUILD_DIR)/celestia
	cp $< $@

$(SOURCE_DIR): $(SOURCE_TAR)
	tar xzf $<

$(SOURCE_TAR):
	wget -O $(SOURCE_TAR) https://github.com/celestiaorg/celestia-node/archive/refs/tags/v$(VERSION).tar.gz

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag celestia-node-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) .
	docker create --platform=linux/riscv64 --name celestia-node-bounty-cp celestia-node-bounty-cp
	docker cp celestia-node-bounty-cp:/root/$@ $@
	docker rm celestia-node-bounty-cp
	touch $@
endif

clean:
	rm -f celestia $(SOURCE_DIR)-bounty_*.tar.xz
	if [ -d "$(BUILD_DIR)" ]; then $(MAKE) -C $(SOURCE_DIR) clean; fi

distclean: clean
	rm -rf celestia-node*

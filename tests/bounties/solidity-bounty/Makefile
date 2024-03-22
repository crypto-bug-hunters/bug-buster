ARCH=$(shell uname -m)
VERSION=0.8.24
SOURCE_TAR=solidity-$(VERSION).tar.gz
SOURCE_DIR=solidity_$(VERSION)
BUILD_DIR=$(SOURCE_DIR)/build
BOUNTY_TAR=solidity-$(VERSION)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=solidity-$(VERSION)-bounty_riscv64.tar.xz

CMAKEFLAGS=-DTESTS=OFF -DUSE_Z3=OFF

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: | $(SOURCE_DIR)

$(BOUNTY_TAR): solc start.sh
	tar cfJ $@ $^

$(BUILD_DIR)/solc/solc: | $(SOURCE_DIR) $(BUILD_DIR)
	$(MAKE) -C $(BUILD_DIR) solc

$(BUILD_DIR):
	cmake -S $(SOURCE_DIR) -B $(BUILD_DIR) $(CMAKEFLAGS)

solc: $(BUILD_DIR)/solc/solc
	cp $< $@

$(SOURCE_DIR): $(SOURCE_TAR)
	tar xzf $<

$(SOURCE_TAR):
	wget -O $(SOURCE_TAR) https://github.com/ethereum/solidity/releases/download/v$(VERSION)/solidity_$(VERSION).tar.gz

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag solidity-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) .
	docker create --platform=linux/riscv64 --name solidity-bounty-cp solidity-bounty-cp
	docker cp solidity-bounty-cp:/root/$@ $@
	docker rm solidity-bounty-cp
	touch $@
endif

clean:
	rm -f solc $(SOURCE_DIR)-bounty_*.tar.xz
	if [ -d "$(BUILD_DIR)" ]; then $(MAKE) -C $(BUILD_DIR) clean; fi

distclean: clean
	rm -rf solidity*

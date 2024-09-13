ARCH?=$(shell uname -m)
ifndef VERSION
    $(error VERSION is not set for Foundry tools (forge and cast).)
endif
SOURCE_TAR=foundry-$(VERSION).tar.bz2
SOURCE_DIR=foundry-$(VERSION)
BOUNTY_TAR=foundry-$(VERSION)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=foundry-$(VERSION)-bounty_riscv64.tar.xz
BINS=forge cast

TARGET?=target/release
BUILD_DIR=$(SOURCE_DIR)/$(TARGET)

HARDEN_CFLAGS=-Os -D_FORTIFY_SOURCE=2 -fPIE -fstack-clash-protection -fstack-protector-strong -ffunction-sections -fdata-sections -Wno-unused-result
HARDEN_LDFLAGS=-pie -Wl,-z,now,-z,relro,--gc-sections -s

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: | $(SOURCE_DIR)

$(BOUNTY_TAR): $(BINS) start.sh
	tar cfJ $@ $^

$(BUILD_DIR): $(SOURCE_DIR)
	cd $(SOURCE_DIR) && cargo build --release $(patsubst %,--bin %,$(BINS))
$(BINS): $(BUILD_DIR)
	$(patsubst %,cp $(BUILD_DIR)/% .;,$(BINS))

$(SOURCE_DIR): $(SOURCE_TAR)
	tar xf $< --strip-components 1 --one-top-level=$@

$(SOURCE_TAR):
	wget -O $(SOURCE_TAR) https://github.com/foundry-rs/foundry/archive/refs/tags/$(VERSION).tar.gz

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag foundry-bounty-cp \
		--file Dockerfile \
		--progress plain \
		--build-arg CARGO_BUILD_TARGET=riscv64gc-unknown-linux-gnu \
		--build-arg VERSION=$(VERSION) \
		--build-arg TARGET=target/riscv64gc-unknown-linux-gnu/release \
		.
	docker create --name foundry-bounty-cp foundry-bounty-cp
	docker cp foundry-bounty-cp:/opt/build/$@ $@
	docker rm foundry-bounty-cp
	touch $@
endif

clean:
	rm -f foundry $(SOURCE_DIR)-bounty_*.tar.xz
	if [ -f "$(SOURCE_DIR)" ]; then cd $(SOURCE_DIR) && cargo clean; fi

distclean: clean
	rm -rf foundry-*

test-exploit:
	./start.sh exploit-foundry-$(VERSION).sh

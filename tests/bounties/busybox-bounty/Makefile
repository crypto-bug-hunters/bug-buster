ARCH=$(shell uname -m)
VERSION=1.36.1
SOURCE_TAR=busybox-$(VERSION).tar.bz2
SOURCE_DIR=busybox-$(VERSION)
BOUNTY_TAR=busybox-$(VERSION)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=busybox-$(VERSION)-bounty_riscv64.tar.xz

HARDEN_CFLAGS=-O1 -ftrivial-auto-var-init=pattern -D_FORTIFY_SOURCE=2 -fPIE -fstack-clash-protection -fstack-protector-strong -ffunction-sections -fdata-sections -Wno-unused-result
HARDEN_LDFLAGS=-pie -Wl,-z,now,-z,relro,--gc-sections -s

# Use GitHub Actions cache when available
ifdef ACTIONS_RUNTIME_TOKEN
ifdef ACTIONS_RUNTIME_URL
ifdef BUILDX_BUILDER
SCOPE=busybox-$(VERSION)-bounty
DOCKEROPTIONS=--cache-from type=gha,scope=$(SCOPE) --cache-to type=gha,mode=max,scope=$(SCOPE) --load
endif
endif
endif

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: | $(SOURCE_DIR)

$(BOUNTY_TAR): busybox start.sh
	tar cfJ $@ $^

busybox: $(SOURCE_DIR)/busybox
	cp $< $@

$(SOURCE_DIR)/busybox: $(SOURCE_DIR)
	$(MAKE) -C $(SOURCE_DIR) CFLAGS="$(HARDEN_CFLAGS)" LDFLAGS="$(HARDEN_LDFLAGS)" busybox

$(SOURCE_DIR): $(SOURCE_TAR)
	tar xjf $(SOURCE_TAR)
	cd $(SOURCE_DIR) && patch -Np1 < ../filter_exit.patch
	cp config $(SOURCE_DIR)/.config

$(SOURCE_TAR):
	wget -O $(SOURCE_TAR) https://busybox.net/downloads/$(SOURCE_TAR)

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag busybox-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) $(DOCKEROPTIONS) .
	docker create --platform=linux/riscv64 --name busybox-bounty-cp busybox-bounty-cp
	docker cp busybox-bounty-cp:/root/$@ $@
	docker rm busybox-bounty-cp
	touch $@
endif

clean:
	rm -f busybox $(SOURCE_DIR)-bounty_*.tar.xz
	if [ -f "$(SOURCE_DIR)/Makefile" ]; then $(MAKE) -C $(SOURCE_DIR) clean; fi

distclean: clean
	rm -rf busybox-*

test-exploit:
	./start.sh exploit-busybox-$(VERSION).sh

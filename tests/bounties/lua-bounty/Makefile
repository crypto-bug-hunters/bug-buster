ARCH=$(shell uname -m)
VERSION=5.4.3
SOURCE_TAR=lua-$(VERSION).tar.gz
SOURCE_DIR=lua-$(VERSION)
BOUNTY_TAR=lua-$(VERSION)-bounty_$(ARCH).tar.xz
BOUNTY_RISCV64_TAR=lua-$(VERSION)-bounty_riscv64.tar.xz

HARDEN_CFLAGS=-O1 -ftrivial-auto-var-init=pattern -D_FORTIFY_SOURCE=2 -fexceptions -fPIE -fstack-clash-protection -fstack-protector-strong -ffunction-sections -fdata-sections
HARDEN_LDFLAGS=-pie -Wl,-z,now,-z,relro,--gc-sections -s

TAR_FLAGS=--sort=name --mtime=@0 --owner=0 --group=0 --numeric-owner --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime

# Use GitHub Actions cache when available
ifdef ACTIONS_RUNTIME_TOKEN
ifdef ACTIONS_RUNTIME_URL
ifdef BUILDX_BUILDER
SCOPE=lua-$(VERSION)-bounty
DOCKEROPTIONS=--cache-from type=gha,scope=$(SCOPE) --cache-to type=gha,mode=max,scope=$(SCOPE) --load
endif
endif
endif

all: $(BOUNTY_TAR)

riscv64: $(BOUNTY_RISCV64_TAR)

download: | $(SOURCE_DIR)

$(BOUNTY_TAR): lua start.sh bounty.lua
	tar $(TAR_FLAGS) -cJf $@ $^

$(SOURCE_DIR)/src/lua: | $(SOURCE_DIR)
	$(MAKE) -C $(SOURCE_DIR)/src MYCFLAGS="$(HARDEN_CFLAGS)" MYLDFLAGS="$(HARDEN_LDFLAGS)" linux

lua: $(SOURCE_DIR)/src/lua
	cp $< $@

$(SOURCE_DIR): $(SOURCE_TAR)
	tar xzf $<

$(SOURCE_TAR):
	wget -O $(SOURCE_TAR) https://www.lua.org/ftp/$(SOURCE_TAR)

ifneq ($(ARCH), riscv64)
$(BOUNTY_RISCV64_TAR): Dockerfile start.sh bounty.lua
	docker build --tag lua-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) $(DOCKEROPTIONS) .
	docker create --platform=linux/riscv64 --name lua-bounty-cp lua-bounty-cp
	docker cp lua-bounty-cp:/root/$@ $@
	docker rm lua-bounty-cp
	touch $@
endif

clean:
	rm -f lua $(SOURCE_DIR)-bounty_*.tar.xz
	if [ -d "$(SOURCE_DIR)" ]; then $(MAKE) -C $(SOURCE_DIR) clean; fi

distclean: clean
	rm -rf lua-*

test-exploit:
	./start.sh exploit-lua-$(VERSION).lua

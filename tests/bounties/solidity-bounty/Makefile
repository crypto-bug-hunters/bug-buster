ARCH=$(shell uname -m)
VERSION=0.8.26
BOUNTY_RISCV64_TAR=solidity-$(VERSION)-bounty_riscv64.tar.xz

# Use GitHub Actions cache when available
ifdef ACTIONS_RUNTIME_TOKEN
ifdef ACTIONS_RUNTIME_URL
ifdef BUILDX_BUILDER
SCOPE=solidity-$(VERSION)-bounty
DOCKEROPTIONS=--cache-from type=gha,scope=$(SCOPE) --cache-to type=gha,mode=max,scope=$(SCOPE) --builder $(BUILDX_BUILDER) --load
endif
endif
endif

riscv64: $(BOUNTY_RISCV64_TAR)

$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag solidity-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) $(DOCKEROPTIONS) .
	docker create --name solidity-bounty-cp solidity-bounty-cp
	docker cp solidity-bounty-cp:/root/$@ $@
	docker rm solidity-bounty-cp
	touch $@

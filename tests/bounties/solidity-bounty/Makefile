ARCH=$(shell uname -m)
VERSION=0.8.26
BOUNTY_RISCV64_TAR=solidity-$(VERSION)-bounty_riscv64.tar.xz

riscv64: $(BOUNTY_RISCV64_TAR)

$(BOUNTY_RISCV64_TAR): Dockerfile start.sh
	docker build --tag solidity-bounty-cp --file Dockerfile --progress plain --build-arg VERSION=$(VERSION) .
	docker create --name solidity-bounty-cp solidity-bounty-cp
	docker cp solidity-bounty-cp:/root/$@ $@
	docker rm solidity-bounty-cp
	touch $@

MACHINE_IMAGE=.cartesi/image.ext2
IIDFILE=.imageid

.PHONY: all
all: bounties $(MACHINE_IMAGE)

.PHONY: bounties
bounties:
	$(MAKE) -C tests/bounties

.PHONY: machine
machine: $(MACHINE_IMAGE)

$(MACHINE_IMAGE): $(IIDFILE)
	pnpm exec cartesi build --from-image "$(shell cat $<)"

$(IIDFILE): Dockerfile .dockerignore go.mod go.sum $(shell find shared contract bwrapbox skel)
	docker build --iidfile $@ --platform linux/riscv64 .

.PHONY: clean
clean:
	$(MAKE) -C tests/bounties clean

.PHONY: distclean
distclean:
	$(MAKE) -C tests/bounties distclean

.PHONY: test
test: bounties
	docker run -v "$(shell pwd):/mnt:ro" --rm -it cryptobughunters/test-image:0.0.0 lua5.4 tests/tests.lua

.PHONY: shell
shell:
	docker run -it -v "$(shell pwd)/.cartesi:/mnt:ro" cryptobughunters/sdk:0.11.1 cartesi-machine --ram-length=128Mi --flash-drive=label:root,filename:/mnt/image.ext2 -it /bin/bash

.PHONY: run-frontend-dev
run-frontend-dev:
	cd frontend && pnpm dev

.PHONY: run-frontend-prod
run-frontend-prod:
	cd frontend && pnpm build && pnpm start

.PHONY: populate
populate:
	./populate.sh

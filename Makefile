.PHONY: all
all: bounties test-image

.PHONY: bounties
bounties:
	$(MAKE) -C tests/bounties

.PHONY: clean
clean:
	$(MAKE) -C tests/bounties clean

.PHONY: distclean
distclean:
	$(MAKE) -C tests/bounties distclean

.PHONY: test-image
test-image:
	docker build --tag bug-buster-test-image --file tests/Dockerfile --progress plain .

.PHONY: test
test:
	docker run -v "$(shell pwd):/mnt" --rm -it bug-buster-test-image lua5.4 tests/tests.lua

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

.PHONY: slides
slides:
	docker run --rm --init -v $$PWD:/home/marp/app/ -e MARP_USER="$(id -u):$(id -g)" marpteam/marp-cli slides.md --allow-local-files --pdf

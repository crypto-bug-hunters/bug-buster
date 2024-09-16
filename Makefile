all: bounties test-image

bounties:
	$(MAKE) -C tests/bounties

clean:
	$(MAKE) -C tests/bounties clean

distclean:
	$(MAKE) -C tests/bounties distclean

test-image:
	docker build --tag bug-buster-test-image --file tests/Dockerfile --progress plain .

test:
	docker run -v $(shell pwd):/mnt --rm -it bug-buster-test-image lua5.4 tests/tests.lua

shell:
	docker run -it -v "$(shell pwd)/.cartesi:/mnt:ro" cryptobughunters/sdk:0.11.1 cartesi-machine --ram-length=128Mi --flash-drive=label:root,filename:/mnt/image.ext2 -it /bin/bash

run-frontend-dev:
	cd frontend && pnpm dev

run-frontend-prod:
	cd frontend && pnpm build && pnpm start

populate:
	./populate.sh

slides:
	docker run --rm --init -v $$PWD:/home/marp/app/ -e MARP_USER="$(id -u):$(id -g)" marpteam/marp-cli slides.md --allow-local-files --pdf

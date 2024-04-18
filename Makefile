all: bounties image

image:
	sunodo build

bounties:
	$(MAKE) -C tests/bounties

test:
	docker run -v $(shell pwd):/mnt --rm -it sunodo/sdk:0.4.0 lua5.4 tests/tests.lua

run:
	sunodo run

run-frontend-dev:
	cd frontend && pnpm dev

run-frontend-prod:
	cd frontend && pnpm build && pnpm start

populate:
	./populate.sh

slides:
	docker run --rm --init -v $$PWD:/home/marp/app/ -e MARP_USER="$(id -u):$(id -g)" marpteam/marp-cli slides.md --allow-local-files --pdf

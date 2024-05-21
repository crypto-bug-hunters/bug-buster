all: bounties test-image image

image:
	cartesi build

bounties:
	$(MAKE) -C tests/bounties

test-image:
	docker build --tag bug-buster-test-image --file tests/Dockerfile --progress plain .

test:
	docker run -v $(shell pwd):/mnt --rm -it bug-buster-test-image lua5.4 tests/tests.lua

run:
	cartesi run

run-frontend-dev:
	cd frontend && pnpm dev

run-frontend-prod:
	cd frontend && pnpm build && pnpm start

populate:
	./populate.sh

slides:
	docker run --rm --init -v $$PWD:/home/marp/app/ -e MARP_USER="$(id -u):$(id -g)" marpteam/marp-cli slides.md --allow-local-files --pdf

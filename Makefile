all: bounties sunodo-sdk-image image

image:
	sunodo build

bounties:
	$(MAKE) -C tests/bounties

sunodo-sdk-image: linux.bin
	docker build --tag sunodo/sdk:0.2.0-sandboxing --file sunodo-sdk.Dockerfile --progress plain .

linux.bin:
	wget -O linux.bin https://github.com/crypto-bug-hunters/bugless/releases/download/kernel/linux.bin

test:
	docker run -v $(shell pwd):/mnt --rm -it sunodo/sdk:0.2.0-sandboxing lua5.4 tests/tests.lua

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

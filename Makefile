all: bounties sunodo-sdk-image image

image:
	sunodo build

bounties:
	$(MAKE) -C tests/bounties

sunodo-sdk-image: linux.bin
	docker build --tag sunodo/sdk:0.2.0-sandboxing --file sunodo-sdk.Dockerfile --progress plain .

linux.bin:
	wget -O linux.bin https://github.com/edubart/riv/releases/download/downloads/linux.bin

test:
	docker run -v $(shell pwd):/mnt --rm -it sunodo/sdk:0.2.0-lua lua5.4 tests/tests.lua

run:
	sunodo run

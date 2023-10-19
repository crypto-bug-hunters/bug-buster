all: sunodo-sdk build
downloads: linux.bin

build:
	sunodo build

linux.bin:
	wget -O linux.bin https://github.com/edubart/riv/releases/download/downloads/linux.bin

sunodo-sdk: linux.bin
	docker build --tag sunodo/sdk:0.2.0-sandboxing --file sunodo-sdk.Dockerfile --progress plain .

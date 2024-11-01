## Back-end

### Set up

First, you need to install the Cartesi CLI with `pnpm`.

```sh
pnpm i
```

### Building the Cartesi Machine image

#### From source

```sh
make machine
```

#### From a tagged image

Every release, the machine image is built and published to GitHub Container Registry.
You can retrieve any given version using the `docker pull` command.

```sh
docker pull --platform linux/riscv64 ghcr.io/crypto-bug-hunters/bug-buster-machine:$VERSION
```

Then, you can build the Cartesi Machine image like so.

```sh
pnpm exec cartesi build --from-image ghcr.io/crypto-bug-hunters/bug-buster-machine:$VERSION
```

### Running the Cartesi Node

```
pnpm start
```

# Bug Buster

<img align="right" height="400" src="logo.png">

Bug bounty programs allow developers to discover vulnerabilities in their applications by rewarding hackers that finds them.
They are mostly held in the Web2 space, and, thus, rarely provide any form of payment guarantee to whitehats.
As a result, developers are able to unfairly underpay whitehats, or even refuse to pay them.

To solve this issue, we have developed Bug Buster—a trustless bug bounty platform powered by [Cartesi Rollups](https://www.cartesi.io/).
Running inside a deterministic RISC-V machine that boots Linux, Bug Buster accepts applications written in any major programming language[^1].
Through a friendly web interface, anyone can submit applications, and sponsor them with ERC-20 tokens to incentivize hackers! All major wallets are supported[^2].
Meanwhile, hackers can test their exploits right on the browser, without even having to sign Web3 transactions!
Once the hacker finds a valid exploit, they can finally send a transaction requesting the reward to be transferred to their account.
If, however, no one is able to submit a valid exploit until a certain deadline, the sponsors may request a refund.

[^1]: Some notable examples of programming languages that can run inside Bug Buster are C, C++, Python, Lua, JavaScript, and Rust.
[^2]: Bug Buster supports +300 wallets, such as WalletConnect, MetaMask, Trust Wallet, and Coinbase.

## Dependencies

For your purposes, not all dependencies may be required.
To help you figure out which dependencies you actually need, here is a table of dependencies for each part of the code base.

| Dependency | Version | Presentation | Back-end | Examples | Tests | Populate | CLI | Front-end |
| :-:        | :-:     | :-:          | :-:      | :-:      | :-:   | :-:      | :-: | :-:       |
| `docker`   | 26.1    | :o:          | :o:      | :o:      | :o:   |          |     |           |
| `go`       | 1.21.1  |              |          |          |       | :o:      | :o: |           |
| `foundry`  | nightly |              |          |          |       | :o:      | :o: |           |
| `jq`       | 1.6     |              |          |          |       | :o:      |     |           |
| `pnpm`     | 9.x     |              | :o:      |          | :o:   | :o:      |     | :o:       |

## Presentation

For more info about the project, check out the slides.
To build the slides, run the following command:

```
make slides
```

## Building example bounties

Before building the machine image and testing, you need to compile the bounties binaries.

```sh
make bounties
```

The following bounties will be compiled and can be used for testing:

```
./tests/bounties/busybox-bounty/busybox-1.36.1-bounty_riscv64.tar.xz
./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz
./tests/bounties/lua-bounty/lua-5.4.6-bounty_riscv64.tar.xz
./tests/bounties/sqlite-bounty/sqlite-3.32.2-bounty_riscv64.tar.xz
./tests/bounties/sqlite-bounty/sqlite-3.43.2-bounty_riscv64.tar.xz
```

Along with following exploits:

```
./tests/bounties/busybox-bounty/exploit-busybox-1.36.1.sh
./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
./tests/bounties/sqlite-bounty/exploit-sqlite-3.32.2.sql
```

## Back-end

### Set up

First, you need to install the Cartesi CLI with `pnpm`.

```sh
pnpm i
```

### Building the Cartesi Machine image

#### From source

```sh
pnpm build
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

## Tests

Make sure you first built the machine image and bounties.
Then, build the test image.

```sh
make test-image
```

Now, you may run the tests.

```sh
make test
```

## CLI

To interact with the contract, you may use the Bug Buster CLI.
For all the options, run the command below.

```sh
go run ./cli help
```

### Showing the current state

```sh
go run ./cli state
```

### Sending dapp address

```sh
go run ./cli send dapp-address
```

### Sending bounty

```sh
go run ./cli send bounty \
    -n "Lua Bounty" \
    -d "Description of Lua bounty" \
    -c ./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz \
    -t 0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2
```

### Sending sponsor

```sh
go run ./cli send sponsor \
    -b 0 \
    -n "Sponsor Name" \
    -t 0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2 \
    -v 5000000
```

### Sending exploit

```sh
go run ./cli send exploit \
    -b 0 \
    -n "Hacker Name" \
    -e ./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
```

### Withdraw bounty

```sh
go run ./cli send withdraw -b 0
```

### Testing exploit

```sh
go run ./cli test \
    -b 0 \
    -e ./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
```

## Populating DApp

Run the following command to fill up the DApp with test data. 

```sh
make populate
```

## Front-end

To run the frontend, execute the commands below.

```sh
cd frontend
pnpm i
pnpm dev
```

Open http://localhost:3000 in your browser.

## Future Work

The initial version of this project was developed in one week for the ETHOnline 2023 hackathon.
During this one week, we had to design and implement a project from scratch.
With this very tight schedule, some of the features were left out for later implementation.
Below are some of those features.

- Support ENS
- Support other types of assets (Ether, ERC-721, and ERC-1155)
- Support syntax highlight on code blocks
- Add optional one-time setup phase for applications
- Add option to download bounty bundle
- Sandbox applications with Hypervisor

## Debugging

When running Bug Buster locally, you might want to perform some operations that would otherwise be impossible in a production environment.
To this end, we advise you to install the [Foundry](https://book.getfoundry.sh/getting-started/installation) toolkit.

### Time travel

When testing sponsor withdrawals, it's handy to be able to instantly advance time past the expiry date of some bounty.
The following command advances time in 30 days, expressed in seconds.

```sh
cast rpc evm_increaseTime $((60*60*24*30))
```

### Funding a wallet

In order to publish transactions, you need some Ether.
The following command sets the balance of address `0xf39Fd...92266` to 1 Ether, expressed in Wei.

```sh
cast rpc anvil_setBalance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 $(cast to-wei 1 ether)
```

# BugLess DApp

BugLess is a decentralized bug bounty platform.

## Building the machine image

```sh
make sunodo-sdk-image
sunodo build
```

## Running the Cartesi Node

```
sunodo run
```

## Building bounties

Before testing, you need to compile bounties binaries.

```sh
make bounties
```

The following bounties will be compiled and can be used for testing:

```
./tests/bounties/sqlite-bounty/sqlite-3.43.2-bounty_riscv64.tar.xz
./tests/bounties/sqlite-bounty/sqlite-3.32.2-bounty_riscv64.tar.xz
./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz
./tests/bounties/lua-bounty/lua-5.4.6-bounty_riscv64.tar.xz
```

Along with following exploits:

```
./tests/bounties/sqlite-bounty/exploit-sqlite-3.32.2.sql
./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
```

## Testing

Before running tests, make sure you built the image and bounties, you can build them with `make all`.

```sh
make test
```

## CLI

To interact with the contract, you may use the BugLess CLI.
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
    -c ./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz
```

### Sending sponsor

```sh
go run ./cli send sponsor -b 0 -n "Sponsor Name" -v 0.05
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

## Frontend

Before running the frontend, you should have the `CartesiDApp` address stored in the `NEXT_PUBLIC_DAPP_ADDRESS` enviroment variable.
In order to take hold of this address, you may run the command below and manually extract the address next to `CartesiDApp`.

```sh
sunodo address-book
```

To set the env var automaticaly, run the following command in the repository root directory.

```sh
export NEXT_PUBLIC_DAPP_ADDRESS=$(sunodo address-book --json | jq -r .CartesiDApp)
```

Also, it seems that this address is constant, so you can just pop this directly.

```sh
export NEXT_PUBLIC_DAPP_ADDRESS=0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C
```

You may also want to send yourself some Ether to play with the DApp.
Here, we're deducting 1 ETH from Alice's balance.

```sh
cast send \
    --value '1ether' \
    --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
    $YOUR_ADDRESS_HERE
```

To run the frontend, execute the commands below.

```shell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in Chrome Browser.

# BugLess DApp

BugLess is a decentralized bug bounty platform.

## Building

```
make sunodo-sdk
sunodo build
```

## Running the Cartesi Node

```
sunodo run
```

## CLI

To interact with the contract, you may use the BugLess CLI.
For all the options, run the command below.

```
go run ./cli help
```

### Showing the current state

```
go run ./cli state
```

### Sending dapp address

```
go run ./cli send dapp-address
```

### Sending bounty

```
go run ./cli send bounty \
    -n "Lua Bounty" \
    -d "Description of Lua bounty" \
    -c ./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz                  
```

### Sending sponsor

```
go run ./cli send sponsor -b 0 -n "Sponsor Name" -v 1000
```

### Sending exploit

```
go run ./cli send exploit \
    -b 0 \
    -n "Hacker Name" \
    -e ./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
```

### Withdraw bounty

```
go run ./cli send withdraw -b 0
```

### Testing exploit

```
go run ./cli test \
    -b 0 \
    -e ./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua
```

## Frontend

Before running the frontend, you should have the `CartesiDApp` address stored in the `NEXT_PUBLIC_DAPP_ADDRESS` enviroment variable.
In order to take hold of this address, you may run the command below and manually extract the address next to `CartesiDApp`.

```
sunodo address-book
```

To set the env var automaticaly, run the following command in the repository root directory.

```
export NEXT_PUBLIC_DAPP_ADDRESS=$(sunodo address-book --json | jq -r .CartesiDApp)
```

To run the frontend, execute the commands below.

```shell
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in Chrome Browser.

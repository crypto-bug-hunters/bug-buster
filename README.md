# BugLess DApp

BugLess is a decentralized bug bounty platform.

## Building

```
sunodo build
```

### Running the Cartesi Node

```
sunodo run
```

### CLI

To interact with the contract, you may use the BugLess CLI.
For all the options, run the command below.

```
go run ./cli help
```

### Frontend

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

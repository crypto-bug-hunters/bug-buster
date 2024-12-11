#!/usr/bin/env bash
set -euo pipefail
shopt -s expand_aliases

SOLC_VERSION=0.8.27

FOUNDRY_REF=2cdbfac
alias cast="cast-$FOUNDRY_REF"
alias forge="forge-$FOUNDRY_REF"

RETH_VERSION=1.0.5
alias reth="reth-$RETH_VERSION"

>&2 echo "Setting up Forge project..."
cp -r src /tmp
cp "$1" /tmp/src/Exploit.sol
cd /tmp

>&2 echo "Building Forge project..."
forge build --use $(which solc-$SOLC_VERSION)

HTTP_ADDR=127.0.0.1
HTTP_PORT=8545

>&2 echo "Starting up Reth..."
reth node \
    --dev \
    --quiet \
    --http.addr $HTTP_ADDR \
    --http.port $HTTP_PORT \
    --log.file.max-files 0 \
    --datadir .local/share/reth &

reth_pid=$!
trap 'kill $reth_pid' EXIT

export ETH_RPC_URL=$HTTP_ADDR:$HTTP_PORT

while true
do
    if chain_id=$(cast chain-id 2>/dev/null)
    then
        if [[ $chain_id == 1337 ]]
        then
            >&2 echo "Reth is listening."
            break
        else
            >&2 echo "Reth has unexpected chain ID $chain_id."
            exit 1
        fi
    else
        if kill -0 $reth_pid
        then
            >&2 echo "Waiting for Reth to start listening..."
            sleep 1
        else
            >&2 echo "Reth exited..."
            exit 1
        fi
    fi
done

PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

deploy() {
    forge create --json --private-key "$PK" "$1:$2" | jq -r .deployedTo
}

>&2 echo "Deploying registry contract..."
REGISTRY=$(deploy src/Registry.sol Registry)

send() {
    >/dev/null cast send --private-key "$PK" "$@"
}

deploy_and_register() {
    address=$(deploy "$@")
    send "$REGISTRY" 'set(string,address)' "$2" "$address"
    echo "$address"
}

>&2 echo "Deploying and registering project contracts..."
ADDER=$(deploy_and_register src/Adder.sol Adder)

>&2 echo "Deploying exploit contract..."
EXPLOIT=$(deploy src/Exploit.sol Exploit)

>&2 echo "Running exploit..."
send "$EXPLOIT" 'run(address)' "$REGISTRY"

>&2 echo "Testing contracts..."
number=$(cast call "$ADDER" 'number()(uint256)')

if [ "$number" -eq 0 ]
then
    >&2 echo "Valid exploit!"
    exit 0
else
    >&2 echo "No exploit found."
    exit 1
fi

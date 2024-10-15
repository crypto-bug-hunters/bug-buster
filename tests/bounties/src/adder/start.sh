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
cp -r foundry.toml src script /tmp
cp "$1" /tmp/script/Exploit.s.sol
cp -r /usr/share/forge-lib /tmp/lib
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
    if chain_id=`cast chain-id 2>/dev/null`
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
        >&2 echo "Waiting for Reth to start listening..."
        sleep 1
    fi
done

PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

run_forge_script() {
    forge script --silent --fork-url $ETH_RPC_URL "$@"
}

run_forge_script_broadcast() {
    run_forge_script --broadcast --slow --private-key $PK "$@"
}

>&2 echo "Deploying contracts..."
FOUNDRY_PROFILE=deploy run_forge_script_broadcast script/Deploy.s.sol:DeployScript

>&2 echo "Running exploit..."
FOUNDRY_PROFILE=exploit run_forge_script_broadcast script/Exploit.s.sol:ExploitScript

>&2 echo "Testing contracts..."
FOUNDRY_PROFILE=test run_forge_script script/Test.s.sol:TestScript

if [ -f exploited ]
then
    >&2 echo "Valid exploit!"
    exit 0
else
    >&2 echo "No exploit found."
    exit 1
fi

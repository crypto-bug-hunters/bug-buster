#!/usr/bin/env bash
source ./setup-exec-env.sh

>&2 echo "Deploying and registering project contracts..."
COUNTER=$(deploy_and_register src/Counter.sol Counter)

>&2 echo "Deploying exploit contract..."
EXPLOIT=$(deploy src/Exploit.sol Exploit)

>&2 echo "Running exploit..."
send "$EXPLOIT" 'run(address)' "$REGISTRY"

>&2 echo "Verifying contracts after exploit execution..."
number=$(cast call "$COUNTER" 'increment()(uint256)')

if [ "$number" -eq 0 ]
then
    >&2 echo "No exploit found."
    exit 1
else
    >&2 echo "Valid exploit!"
    exit 0
fi

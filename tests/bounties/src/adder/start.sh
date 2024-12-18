#!/usr/bin/env bash
source ./setup-exec-env.sh

>&2 echo "Deploying and registering project contracts..."
ADDER=$(deploy_and_register src/Adder.sol Adder)

>&2 echo "Deploying exploit contract..."
EXPLOIT=$(deploy src/Exploit.sol Exploit)

>&2 echo "Running exploit..."
send "$EXPLOIT" 'run(address)' "$REGISTRY"

>&2 echo "Verifying contracts after exploit execution..."
number=$(cast call "$ADDER" 'number()(uint256)')

if [ "$number" -eq 0 ]
then
    >&2 echo "Valid exploit!"
    exit 0
else
    >&2 echo "No exploit found."
    exit 1
fi

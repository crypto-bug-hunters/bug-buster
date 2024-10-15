#!/usr/bin/env bash
set -euo pipefail
source aliases.sh
SOLC="$(which solc)"
PK="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
FORK_URL="http://127.0.0.1:8545"
ln -s /usr/share/forge-lib lib
cp "$1" script/Exploit.s.sol
forge build --use "$SOLC"
reth node --dev --quiet &
FOUNDRY_PROFILE=deploy forge script script/Deploy.s.sol:DeployScript --broadcast --private-key "$PK" --fork-url "$FORK_URL"
FOUNDRY_PROFILE=exploit forge script script/Exploit.s.sol:ExploitScript --broadcast --private-key "$PK" --fork-url "$FORK_URL"
FOUNDRY_PROFILE=test forge script script/Test.s.sol:TestScript --broadcast --private-key "$PK" --fork-url "$FORK_URL"
if [ -f ./success ]
then
    >&2 echo "Tests passed, invalid exploit"
    exit 1
else
    >&2 echo "Tests failed, valid exploit"
    exit 0
fi

#!/usr/bin/env bash

set -euo pipefail

TOKEN_ADDRESS=$(pnpm exec cartesi address-book --json | jq -r .TestToken)
TOKEN_DECIMALS=$(cast call "$TOKEN_ADDRESS" 'decimals()(uint8)')

DEV_ACCOUNT=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
SPONSOR_ACCOUNT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
HACKER_ACCOUNT=0x976EA74026E726554dB657fA54763abd0C3a0aa9

ONE_DAY=$((60*60*24))
SPONSORSHIP_AMOUNT=$((10**"$TOKEN_DECIMALS"))

# Approve ERC-20 token transfers through the ERC-20 portal

ERC20_PORTAL_ADDRESS=$(pnpm exec cartesi address-book --json | jq -r .ERC20Portal)
TOKEN_ALLOWANCE=$(cast max-uint)

cast send \
    --unlocked \
    --from "$SPONSOR_ACCOUNT" \
    "$TOKEN_ADDRESS" \
    'approve(address,uint256)' \
    "$ERC20_PORTAL_ADDRESS" \
    "$TOKEN_ALLOWANCE"

#=====#
# Lua #
#=====#

LUA_INFO_FILE=tests/bounties/lua-bounty/info.json
LUA_DESCRIPTION=$(jq -r '.description' "$LUA_INFO_FILE")
LUA_IMG_LINK=$(jq -r '.imgLink' "$LUA_INFO_FILE")
LUA_SPONSOR_NAME="Spencer Lunatik"
LUA_HACKER_NAME="Hackett Rock"

# 5.4.3

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "Lua 5.4.3" \
    -i "$LUA_IMG_LINK" \
    -d "$LUA_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/lua-5.4.3-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$LUA_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

go run ./cli send exploit \
    -f "$HACKER_ACCOUNT" \
    -b "$bounty_index" \
    -e 'tests/bounties/lua-bounty/exploit-lua-5.4.3.lua' \
    -n "$LUA_HACKER_NAME"

# 5.4.6

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "Lua 5.4.6" \
    -i "$LUA_IMG_LINK" \
    -d "$LUA_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/lua-5.4.6-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$LUA_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

#========#
# SQLite #
#========#

SQLITE_INFO_FILE=tests/bounties/sqlite-bounty/info.json
SQLITE_DESCRIPTION=$(jq -r '.description' "$SQLITE_INFO_FILE")
SQLITE_IMG_LINK=$(jq -r '.imgLink' "$SQLITE_INFO_FILE")
SQLITE_SPONSOR_NAME="Spencer D. B. M. S."
SQLITE_HACKER_NAME="Hackett Query"

# 3.32.2

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "SQLite 3.32.2" \
    -i "$SQLITE_IMG_LINK" \
    -d "$SQLITE_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/sqlite-3.32.2-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$SQLITE_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

go run ./cli send exploit \
    -f "$HACKER_ACCOUNT" \
    -b "$bounty_index" \
    -e 'tests/bounties/sqlite-bounty/exploit-sqlite-3.32.2.sql' \
    -n "$SQLITE_HACKER_NAME"

# 3.43.2

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "SQLite 3.43.2" \
    -i "$SQLITE_IMG_LINK" \
    -d "$SQLITE_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/sqlite-3.43.2-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$SQLITE_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

#=========#
# BusyBox #
#=========#

BUSYBOX_INFO_FILE=tests/bounties/busybox-bounty/info.json
BUSYBOX_DESCRIPTION=$(jq -r '.description' "$BUSYBOX_INFO_FILE")
BUSYBOX_IMG_LINK=$(jq -r '.imgLink' "$BUSYBOX_INFO_FILE")
BUSYBOX_SPONSOR_NAME="Spencer Toolchain"
BUSYBOX_HACKER_NAME="Hackett Linux"

# 1.36.1

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "BusyBox 1.36.1" \
    -i "$BUSYBOX_IMG_LINK" \
    -d "$BUSYBOX_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/busybox-1.36.1-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$BUSYBOX_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

go run ./cli send exploit \
    -f "$HACKER_ACCOUNT" \
    -b "$bounty_index" \
    -e 'tests/bounties/busybox-bounty/exploit-busybox-1.36.1.sh' \
    -n "$BUSYBOX_HACKER_NAME"

#==========#
# Solidity #
#==========#

SOLIDITY_INFO_FILE=tests/bounties/solidity-bounty/info.json
SOLIDITY_DESCRIPTION=$(jq -r '.description' "$SOLIDITY_INFO_FILE")
SOLIDITY_IMG_LINK=$(jq -r '.imgLink' "$SOLIDITY_INFO_FILE")
SOLIDITY_SPONSOR_NAME="Spencer Smart"

# 0.8.27

bounty_index=$(go run ./cli state | jq '.bounties | length')

go run ./cli send bounty \
    -f "$DEV_ACCOUNT" \
    -n "Solidity 0.8.27" \
    -i "$SOLIDITY_IMG_LINK" \
    -d "$SOLIDITY_DESCRIPTION" \
    --duration "$ONE_DAY" \
    -p '/bounties/examples/solidity-0.8.27-bounty_riscv64.tar.xz' \
    -t "$TOKEN_ADDRESS"

go run ./cli send sponsor \
    -f "$SPONSOR_ACCOUNT" \
    -b "$bounty_index" \
    -n "$SOLIDITY_SPONSOR_NAME" \
    -t "$TOKEN_ADDRESS" \
    -v "$SPONSORSHIP_AMOUNT"

LUA_ACCOUNT=3
SQLITE_ACCOUNT=4
RICH_SPONSOR_ACCOUNT=5
HACKER_ACCOUNT=6

# send DApp address so we can generate vouchers later
go run ./cli send dapp-address

# Lua 5.4.3
CURR_BOUNTY=$(go run ./cli state | jq '.Bounties | length')
go run ./cli send bounty \
    -a $LUA_ACCOUNT \
    -n "Lua 5.4.3" \
    -i "https://upload.wikimedia.org/wikipedia/commons/c/cf/Lua-Logo.svg" \
    -d "Released on 29 March 2021" \
    -c "./tests/bounties/lua-bounty/lua-5.4.3-bounty_riscv64.tar.xz"

go run ./cli send sponsor \
    -a $LUA_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Lua Sponsor" \
    -v 0.05

go run ./cli send sponsor \
    -a $RICH_SPONSOR_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Rich Crypto Guy" \
    -v 1.337

go run ./cli send exploit \
    -a $HACKER_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Mike" \
    -e "./tests/bounties/lua-bounty/exploit-lua-5.4.3.lua"

# Lua 5.4.6
CURR_BOUNTY=$(go run ./cli state | jq '.Bounties | length')
go run ./cli send bounty \
    -a $LUA_ACCOUNT \
    -n "Lua 5.4.6" \
    -i "https://upload.wikimedia.org/wikipedia/commons/c/cf/Lua-Logo.svg" \
    -d "Released on 14 May 2023" \
    -c "./tests/bounties/lua-bounty/lua-5.4.6-bounty_riscv64.tar.xz"

go run ./cli send sponsor \
    -a $LUA_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Lua Sponsor" \
    -v 0.05

go run ./cli send sponsor \
    -a $RICH_SPONSOR_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Rich Crypto Guy" \
    -v 1.337

# SQLite 3.32.2
CURR_BOUNTY=$(go run ./cli state | jq '.Bounties | length')
go run ./cli send bounty \
    -a $SQLITE_ACCOUNT \
    -n "SQLite 3.32.2" \
    -i "https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg" \
    -d "Released on 4 June 2020" \
    -c "./tests/bounties/sqlite-bounty/sqlite-3.32.2-bounty_riscv64.tar.xz"

go run ./cli send sponsor \
    -a $SQLITE_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Lua Sponsor" \
    -v 0.32

go run ./cli send sponsor \
    -a $RICH_SPONSOR_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Rich Crypto Guy" \
    -v 1.337

# SQLite 3.43.2
CURR_BOUNTY=$(go run ./cli state | jq '.Bounties | length')
go run ./cli send bounty \
    -a $SQLITE_ACCOUNT \
    -n "SQLite 3.43.2" \
    -i "https://upload.wikimedia.org/wikipedia/commons/3/38/SQLite370.svg" \
    -d "Released on 10 October 2023" \
    -c "./tests/bounties/sqlite-bounty/sqlite-3.43.2-bounty_riscv64.tar.xz"

go run ./cli send sponsor \
    -a $SQLITE_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Lua Sponsor" \
    -v 0.43

go run ./cli send sponsor \
    -a $RICH_SPONSOR_ACCOUNT \
    -b $CURR_BOUNTY \
    -n "Rich Crypto Guy" \
    -v 1.337

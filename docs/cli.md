## CLI

To interact with the contract, you may use the Bug Buster CLI.
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
    -c ./tests/bounties/dist/lua-5.4.3-bounty.tar.xz \
    -t 0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2
```

### Sending sponsor

```sh
go run ./cli send sponsor \
    -b 0 \
    -n "Sponsor Name" \
    -t 0x92C6bcA388E99d6B304f1Af3c3Cd749Ff0b591e2 \
    -v 5000000
```

### Sending exploit

```sh
go run ./cli send exploit \
    -b 0 \
    -n "Hacker Name" \
    -e ./tests/bounties/src/lua/exploit-lua-5.4.3.lua
```

### Withdraw bounty

```sh
go run ./cli send withdraw -b 0
```

### Testing exploit

```sh
go run ./cli test \
    -b 0 \
    -e ./tests/bounties/src/lua/exploit-lua-5.4.3.lua
```

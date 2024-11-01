## Debugging

When running Bug Buster locally, you might want to perform some operations that would otherwise be impossible in a production environment.
To this end, we advise you to install the [Foundry](https://book.getfoundry.sh/getting-started/installation) toolkit.

### Shell

If you want to run the machine locally through a shell interface, you can do so through the following command.
Please make sure you have built the machine beforehand.

```sh
make shell
```

### Time travel

When testing sponsor withdrawals, it's handy to be able to instantly advance time past the expiry date of some bounty.
The following command advances time in 30 days, expressed in seconds.

```sh
cast rpc evm_increaseTime $((60*60*24*30))
```

### Funding a wallet

In order to publish transactions, you need some Ether.
The following command sets the balance of address `0xf39Fd...92266` to 1 Ether, expressed in Wei.

```sh
cast rpc anvil_setBalance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 $(cast to-wei 1 ether)
```

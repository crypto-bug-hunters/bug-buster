# Bug Buster

<img align="right" height="400" src="logo.png">

Bug bounty programs allow developers to discover vulnerabilities in their applications by rewarding hackers that finds them.
They are mostly held in the Web2 space, and, thus, rarely provide any form of payment guarantee to whitehats.
As a result, developers are able to unfairly underpay whitehats, or even refuse to pay them.

To solve this issue, we have developed Bug Buster—a trustless bug bounty platform powered by [Cartesi Rollups](https://www.cartesi.io/).
Running inside a deterministic RISC-V machine that boots Linux, Bug Buster accepts applications written in any major programming language[^1].
Through a friendly web interface, anyone can submit applications, and sponsor them with ERC-20 tokens to incentivize hackers! All major wallets are supported[^2].
Meanwhile, hackers can test their exploits right on the browser, without even having to sign Web3 transactions!
Once the hacker finds a valid exploit, they can finally send a transaction requesting the reward to be transferred to their account.
If, however, no one is able to submit a valid exploit until a certain deadline, the sponsors may request a refund.

[^1]: Some notable examples of programming languages that can run inside Bug Buster are C, C++, Python, Lua, JavaScript, and Rust.
[^2]: Bug Buster supports +300 wallets, such as WalletConnect, MetaMask, Trust Wallet, and Coinbase.

## Documentation

- [Dependencies](docs/dependencies.md)
- Running
  - [Back-end](docs/backend.md)
  - [Populate script](docs/populate.md)
  - [Front-end](docs/frontend.md)
- Contributing
  - [Tests](docs/tests.md)
  - [Bug Buster CLI](docs/cli.md)
  - [Debugging](docs/debug.md)
- [Future work](docs/future.md)

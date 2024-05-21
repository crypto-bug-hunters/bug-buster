---
theme: gaia
_class: lead
paginate: true
---

![bg left:35% 90%](./logo.png)

# Bug Buster

October 2023

*github.com/crypto-bug-hunters/bug-buster*

---

# Team Members

- Eduardo Barthel
- Francisco Moura
- Gabriel Ligneul
- Guilherme Dantas

---

# A Trustless Bug Bounty Platform

- Bug bounty programs unite hackers and developers to identify bugs for rewards.
- Yet, there's no formal guarantee of fairness. Developers might downplay bug severity, underpay, or not pay at all. 
- Enter Bug Buster: a transparent bug bounty system using Cartesi Rollups. This lets developers set clear application invariants. If breached, it prompts a reward for the deserving hacker.

---

# What We Developed

- A DApp back-end integrated with the Cartesi Rollups framework, featuring a sandboxed environment for running arbitrary Linux programs on the blockchain.
- A comprehensive front-end application designed to interface with the back-end, sending inputs to the Ethereum Node and retrieving DApp outcomes from the Cartesi Rollups Node.

---

# DApp Interaction


- A developer posts a new bounty for a Linux program on Bug Buster, uploading the program binary to the blockchain via rollups.
- A sponsor backs the bounty by transferring Ether to Bug Buster. If no exploit is found by the deadline, the sponsor can retrieve their funds.
- A hacker attempts to breach the program and claim the bounty. Upon discovering an exploit, they can submit an input to Bug Buster to withdraw the reward.

---

# Bounty examples

To demonstrate Bug Buster's efficacy, we established three test cases using real-world programs with known vulnerabilities.

- Lua: An efficient, lightweight, and embeddable scripting language.
- SQLite: The world's most widely adopted database engine.
- BusyBox: A comprehensive suite offering various Unix utilities.

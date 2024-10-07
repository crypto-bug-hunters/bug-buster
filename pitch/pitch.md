## RL Model Bounties in Bugbuster

### Introduction

* Team
* How we got here: hackathon, CSG program
* On Cartesi
	+ Basically a Linux runtime that is deterministic and cryptographically verifiable; That means you can write programs with all of the tools that you are used to, but they can be used for blockchain applications

### Bug Buster Diagram Before

### Bug Buster Architecture Before

* Frontend
	+ Explore
	+ Exploit/[id]
	+ Exploit with collected bounty
	+ Models
* Dapp
	+ InputKinds
		- AddSponsorship
		- Withdraw sponsorship
		- AddBounty
		- SendExploit
			- Important
	+ BugBusterContract
	+ AppBounty
	+ MakePayment
* CLI
	+ Commands for interacting with the Dapp more easily
* Bounties
	+ Tar file with everything needed to test an exploit - including the program and a script to orchestrate initialization and bounty execution

### Bug Buster Diagram After

### New Architecture

* Frontend
	+ Explore
	+ Exploit/[id]
	+ Exploit with collected bounty
	+ Models
* Dapp
	+ InputKinds
		- AddSponsorship
		- Withdraw sponsorship
		- AddBounty
		- Send**Exploit**
			- RLModelBounty
			- BugBounty
	+ BugBusterContract
	+ AppBounty
		- BountyType
		- Attempts
	+ MakePayment
* CLI
	+ Commands for interacting with the Dapp more easily
* Bounties
	+ RLBounty
		- Tar with environment.py and test.py (more details below)
	+ BugBounty:
		- Same tar as before

### Part-by-Part Changes

* Dapp
	+ Distinction between bug bounties and model bounties. Bug bounties pay when an input that causes the bug is found, model bounties pay when an input is received (we can do this in the inspect to avoid an extra transaction) after the deadline, and the winner is determined by the best metric.
	+ AppBounty
		- New fields: BountyType (RLModelBounty or BugBounty) and Attempts (Hacker, inputIndex, score)
		- Attempts
			- Field necessary to judge the best attempt later.
* Frontend
	+ Explore
		- Distinction between bug and RL bounty types, possibility to filter
	+ Exploit/[id]
		- When the bounty is collected for RL bounties, it is possible to download the model (model is public)
		- Environment to test changes locally
	+ Changes in models
		- New fields in the AppBounty interface: Attempts, bountyType
* Bounties
	+ RLBounty
		- environment.py contains code that will be shown to platform users to aid in local development (simulation environment, for example, or a boilerplate to start from).
		- test.py contains code that runs the simulation with the sent model; Should print only 1 thing in stdout, the model score (the metric must be of the type "the higher the better" for the backend to compare later); The code will receive as the first argument the path of the model being tested (in onnx format) and the second argument is the transaction timestamp to serve as a seed for the environment.
* OS Environment
	+ Changed to ubuntu slim-jammy (from noble) to utilize our cp310 onnxruntime wheel
	+ Increased memory from 128Mi to 1024Mi

### Final Result

* New type of bounty added: ; Start of a marketplace for AI models.
* Demo of the application (video)
* About the Cartesi development environment, some observations (it's possible that we didn't look enough)
	+ Better introspection tools (it takes a long time to rebuild the Cartesi image)
		- Nonodo (a tool that runs the application without running a container, which is much faster to startup and consequently iterate) wasn't an option due to the different file directory structure configured in the Dockerfile (or at least it seemed like it would take a lot of work to make work)
		- Maybe something like being able to see all variables? Being able to debug?
	+ Authentication equivalent for rollups?
		- We realized that a lot of what makes rollup development hard to do (both from a technical and product perspective) is the fact that there isn't an "authentication" paradigm equivalent?
	+ Some minor CLI problems
		- We had to build the image twice before our changes took effect (maybe a cache problem?)
	+ Overall
		- Amazing experience! Our team had almost no experience in developing smart contracts, and no experience with blockchain applications.
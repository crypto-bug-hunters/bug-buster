## RL Model Bounties in Bug Buster: Technical Writeup

### Introduction

The core aim was to introduce RL (Reinforcement Learning) model bounties into **Bug Buster**, a trustless bug bounty platform. Bug Buster operates within a deterministic Linux environment powered by Cartesi Rollups, allowing traditional tools and languages to be used in blockchain applications.

### Bug Buster Architecture Before

Previously, Bug Buster supported bug bounties in a straightforward manner, allowing sponsors to submit applications with a bounty in ERC-20 tokens and hackers to collect the bounty upon discovering and submitting an exploit. The architecture included:

- **Frontend**:
  - Pages for exploring bounties, viewing bounty details (via `/exploit/[id]`), and submitting a collected bounty.
  
- **Dapp**:
  - Supported several input kinds, including `AddSponsorship`, `WithdrawSponsorship`, `AddBounty`, and `SendExploit`.
  - Managed contract interaction via the `BugBusterContract` and `AppBounty`.
  - The bounty was paid out through the `MakePayment` function upon submission of a valid exploit.

- **CLI**:
  - Simplified interaction with the Dapp through a set of commands that allowed easier bounty management.

- **Bounties**:
  - A tar file with all necessary components (such as the target program and testing scripts) was used to encapsulate the test environment for bug submissions.

### Bug Buster Architecture After

With the addition of RL model bounties, the architecture expanded to support this new type of bounty while maintaining the core structure for bug bounties.

- **Frontend**:
  - The pages for exploring and viewing bounties remained, but now included the ability to filter between bug bounties and RL model bounties.
  - For RL model bounties, users could download the submitted model for local testing.

- **Dapp**:
  - The core change was the distinction between bug bounties and RL model bounties:
    - **Bug bounties**: Hackers are rewarded when they submit an input that triggers the bug.
    - **RL model bounties**: Hackers are rewarded based on the best-scoring model submission after the bounty's deadline.
  - The `SendExploit` input kind was modified to differentiate between `RLModelBounty` and `BugBounty`.
  - **New Fields** in `AppBounty`:
    - `BountyType`: Specifies whether a bounty is a `RLModelBounty` or `BugBounty`.
    - `Attempts`: A data structure containing the hacker's submission, the input index, and the corresponding score.
  - These changes allow the Dapp to store and compare multiple model submissions, judging the winner based on the highest score.

- **CLI**:
  - The CLI was updated to reflect the changes in the bounty structure, allowing users to specify bounty types and interact with new data fields like `Attempts` when managing RL bounties.

- **Bounties**:
  - **RLModelBounty**: 
    - Introduced a new tar file format containing `environment.py` and `test.py`.
      - `environment.py`: Contains helper code (like a simulation environment or boilerplate) to assist users with local testing.
      - `test.py`: Executes the model, receiving the path to the ONNX model and the transaction timestamp as a seed for the environment. It outputs the model's score, which the backend compares to other submissions. The metric used must follow a "higher is better" rule for scoring.
  - **BugBounty**:
    - Remains unchanged, still utilizing a tar file with the program and testing scripts.

### Part-by-Part Changes

#### Dapp

The distinction between bug bounties and RL model bounties was essential for enabling new bounty types. In RL model bounties, payment is based on the best submission rather than the first valid input. The AppBounty's `BountyType` field now distinguishes between these two bounty categories, and the `Attempts` field stores multiple submissions and their corresponding scores. This allows the system to automatically reward the highest-scoring submission after the deadline.

#### Frontend

- **Explore Page**: Users can now filter between bug bounties and RL model bounties.
- **Exploit Page** (`/exploit/[id]`): For RL bounties, users can download the submitted ONNX models and test them locally in a provided environment. This interface was expanded to show the number of attempts and provide details about RL submissions.
- **Model Interface**: New fields such as `Attempts` and `BountyType` were introduced to reflect the RL model submission process, and these were integrated into the user-facing components.

#### Bounties

The RLModelBounty's tar file contains the following critical components:

- **`environment.py`**: This file assists the user in creating a local development environment, providing a simulation environment or example code.
- **`test.py`**: This script evaluates the RL model using the ONNX format. The script receives two arguments: the path to the model and the timestamp of the transaction. It outputs the model’s score, which is then recorded in the Dapp’s `Attempts` field for later comparison.

#### OS Environment

To support RL model bounties and the ONNX models they rely on, we made significant changes to the OS environment:

- Switched from Ubuntu Noble to **slim-jammy** to allow the installation of the **cp310 ONNX Runtime wheel**.
- Increased memory allocation from **128Mi to 1024Mi** to handle the additional computational load from executing ONNX models.

### Final Result

We successfully extended Bug Buster to support RL model bounties, effectively creating a marketplace for AI models in the blockchain space. Hackers can now submit models that are judged based on their performance, and sponsors can incentivize the development of AI solutions in a trustless and verifiable way. 

### Challenges in the Cartesi Development Environment

The Cartesi environment provides a robust platform for developing blockchain applications, but we faced some challenges:

1. **Long Rebuild Times**: Each change in the environment required rebuilding the Cartesi image, which took considerable time. A faster alternative for iteration, such as a debugging mode, would have been beneficial. **Nonodo** (a tool for running applications without containers) was not an option due to the specific Dockerfile structure in use.
   
2. **Lack of Debugging Tools**: It was difficult to inspect variables and state during runtime. Having a tool to better introspect the running Cartesi environment (like traditional debugging tools) would have significantly improved development speed.

3. **CLI Issues**: There were times when we had to build the image twice before changes took effect, possibly due to caching issues. This added friction to the development process.

4. **Authentication for Rollups**: We identified that there isn't a direct equivalent for "authentication" in rollup development, which presents unique challenges both technically and from a product design standpoint.

Despite these challenges, our overall experience was **positive**. None of our team members had significant experience with smart contracts or blockchain development prior to this project, but we were able to quickly adapt and build on Cartesi's infrastructure. The flexibility and deterministic nature of Cartesi Rollups made it a powerful platform for our use case.

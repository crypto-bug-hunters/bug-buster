// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {DeploymentReaderScript} from "forge-deploy-lib/DeploymentScript.sol";

import {IAdder} from "src/IAdder.sol";

contract AssertionScript is DeploymentReaderScript {
    function run() external {
        loadDeployment();
        IAdder adder = IAdder(getContract("Adder"));
        if (adder.number() >= 1) return;
        vm.writeFile("./exploited", "");
    }
}

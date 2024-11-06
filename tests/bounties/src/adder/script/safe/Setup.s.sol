// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {DeploymentWriterScript} from "forge-deploy-lib/src/DeploymentScript.sol";

import {SafeAdder} from "src/safe/Adder.sol";

contract SetupScript is DeploymentWriterScript {
    function run() external {
        vm.startBroadcast();
        addContract("Adder", address(new SafeAdder()));
        vm.stopBroadcast();

        storeDeployment();
    }
}

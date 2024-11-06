// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {DeploymentWriterScript} from "forge-deploy-lib/DeploymentScript.sol";

import {UnsafeAdder} from "src/unsafe/Adder.sol";

contract SetupScript is DeploymentWriterScript {
    function run() external {
        vm.startBroadcast();
        addContract("Adder", address(new UnsafeAdder()));
        vm.stopBroadcast();

        storeDeployment();
    }
}

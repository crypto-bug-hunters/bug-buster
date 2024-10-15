// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {SafeAdder} from "src/safe/Adder.sol";
import {Deployments, LibDeployments} from "script/LibDeployments.sol";

contract DeployScript is Script {
    using LibDeployments for Vm;

    function run() external {
        Deployments memory deployments;

        vm.startBroadcast();
        deployments.adder = new SafeAdder();
        vm.stopBroadcast();

        vm.storeDeployments(deployments);
    }
}

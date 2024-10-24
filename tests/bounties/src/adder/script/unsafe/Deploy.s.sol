// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {UnsafeAdder} from "src/unsafe/Adder.sol";
import {Deployments, LibDeployments} from "script/LibDeployments.sol";

contract DeployScript is Script {
    using LibDeployments for Vm;

    function run() external {
        Deployments memory deployments;

        vm.startBroadcast();
        deployments.adder = new UnsafeAdder();
        vm.stopBroadcast();

        vm.storeDeployments(deployments);
    }
}

// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {Deployments, LibDeployments} from "script/LibDeployments.sol";

contract TestScript is Script {
    using LibDeployments for Vm;

    function run() external {
        Deployments memory deployments = vm.loadDeployments();
        if (deployments.adder.number() >= 1) return;
        vm.writeFile("./exploited", "");
    }
}

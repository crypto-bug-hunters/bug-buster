// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {Vm} from "forge-std/Vm.sol";
import {IAdder} from "../src/IAdder.sol";
import {Deployments, LibDeployments} from "./LibDeployments.sol";

contract ExploitScript is Script {
    using LibDeployments for Vm;

    function run() external {
        Deployments memory deployments = vm.loadDeployments();

        vm.assertGe(deployments.adder.number(), 1);

        vm.writeFile("./success", "");
    }
}

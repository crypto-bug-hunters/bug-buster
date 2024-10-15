// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {Vm} from "forge-std/Vm.sol";
import {IAdder} from "src/IAdder.sol";

struct Deployments {
    IAdder adder;
}

library LibDeployments {
    function getDeploymentsPath(Vm vm) internal view returns (string memory) {
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/deployments.json");
        return path;
    }

    function storeDeployments(Vm vm, Deployments memory deployment) internal {
        string memory json = vm.serializeAddress("deployments", "adder", address(deployment.adder));
        vm.writeJson(json, getDeploymentsPath(vm));
    }

    function loadDeployments(Vm vm) internal view returns (Deployments memory) {
        string memory json = vm.readFile(getDeploymentsPath(vm));
        bytes memory data = vm.parseJson(json);
        return abi.decode(data, (Deployments));
    }
}

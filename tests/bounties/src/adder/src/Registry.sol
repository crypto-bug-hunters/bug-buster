// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.28;

import {IRegistry} from "./IRegistry.sol";

contract Registry is IRegistry {
    mapping(string name => address addr) public get;

    function set(string memory name, address addr) external override {
        get[name] = addr;
    }
}

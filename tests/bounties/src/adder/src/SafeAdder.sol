// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {IAdder} from "./IAdder.sol";

contract SafeAdder is IAdder {
    uint8 public number = 1;

    function add(uint8 x) external override {
        number += x;
    }
}

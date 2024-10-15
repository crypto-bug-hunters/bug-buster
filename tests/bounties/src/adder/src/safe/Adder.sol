// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

import {IAdder} from "../IAdder.sol";

contract SafeAdder is IAdder {
    uint256 public number = 1;

    function add(uint256 x) external override {
        number += x;
    }
}

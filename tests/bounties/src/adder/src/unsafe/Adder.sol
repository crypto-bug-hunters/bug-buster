// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.28;

import {IAdder} from "src/IAdder.sol";

contract Adder is IAdder {
    uint256 public number = 1;

    function add(uint256 x) external override {
        unchecked {
            number += x;
        }
    }
}

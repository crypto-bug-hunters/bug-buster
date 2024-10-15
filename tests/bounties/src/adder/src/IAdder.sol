// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

interface IAdder {
    function number() external view returns (uint8);
    function add(uint8) external;
}

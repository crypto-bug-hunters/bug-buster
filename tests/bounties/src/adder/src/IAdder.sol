// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.27;

interface IAdder {
    function number() external view returns (uint256);
    function add(uint256) external;
}

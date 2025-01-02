// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.28;

interface IRegistry {
    function get(string memory name) external view returns (address addr);
    function set(string memory name, address addr) external;
}

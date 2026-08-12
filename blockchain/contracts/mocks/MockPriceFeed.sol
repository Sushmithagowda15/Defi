// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MockPriceFeed {

    int256 private price;

    uint8 public constant decimals = 8;

    constructor(int256 initialPrice) {
        price = initialPrice;
    }

    function latestAnswer() external view returns (int256) {
        return price;
    }

    function setPrice(int256 newPrice) external {
        require(newPrice > 0, "Price must be greater than zero");

        price = newPrice;
    }
}
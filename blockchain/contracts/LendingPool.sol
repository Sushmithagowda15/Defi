// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract LendingPool {

    struct Loan {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 startTime;
        bool active;
    }

    mapping(address => Loan) public loans;
    event CollateralDeposited(
         address indexed borrower,
         uint256 amount
    );

    function depositCollateral() external payable {
      require(msg.value > 0, "Collateral must be greater than zero");

      loans[msg.sender].collateralAmount += msg.value;

      emit CollateralDeposited(msg.sender, msg.value);
    }
}
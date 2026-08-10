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
    event CollateralWithdrawn(
      address indexed borrower,
      uint256 amount
    );

    event CollateralDeposited(
         address indexed borrower,
         uint256 amount
    );

    function depositCollateral() external payable {
      require(msg.value > 0, "Collateral must be greater than zero");

      loans[msg.sender].collateralAmount += msg.value;

      emit CollateralDeposited(msg.sender, msg.value);
    }

    function withdrawCollateral(uint256 amount) external {
      require(amount > 0, "Withdrawal amount must be greater than zero");

      require(
        loans[msg.sender].collateralAmount >= amount,
        "Insufficient collateral"
      );

      loans[msg.sender].collateralAmount -= amount;

      (bool success, ) = payable(msg.sender).call{value: amount}("");

      require(success, "ETH transfer failed");

      emit CollateralWithdrawn(msg.sender, amount);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {

    function transfer(
        address to,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function balanceOf(
        address account
    ) external view returns (uint256);

    function mint(
        address to,
        uint256 amount
    ) external;
}

interface IPriceFeed {
    function latestAnswer()
        external
        view
        returns (int256);

    function decimals()
        external
        view
        returns (uint8);
}

contract LendingPool {

    struct Loan {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 startTime;
        bool active;
    }

    mapping(address => Loan) public loans;

    IERC20 public usdc;
    IPriceFeed public priceFeed;

    uint256 public constant MAX_LTV = 70;
    uint256 public constant LIQUIDATION_BONUS = 5;

    constructor(
      address _usdc,
      address _priceFeed
    ) {
      usdc = IERC20(_usdc);
      priceFeed = IPriceFeed(_priceFeed);
    }

    event CollateralWithdrawn(
      address indexed borrower,
      uint256 amount
    );

    event CollateralDeposited(
         address indexed borrower,
         uint256 amount 
    );

    event Borrowed(
    address indexed borrower,
    uint256 amount
    );

    event Repaid(
    address indexed borrower,
    uint256 amount
    );

    event Liquidated(
    address indexed borrower,
    address indexed liquidator,
    uint256 debtRepaid,
    uint256 collateralSeized
    );

    function depositCollateral() external payable {
      require(msg.value > 0, "Collateral must be greater than zero");

      loans[msg.sender].collateralAmount += msg.value;

      emit CollateralDeposited(msg.sender, msg.value);
    }

    function getCollateralValue(
    address borrower
    ) public view returns (uint256) {

     return _getCollateralValue(
        loans[borrower].collateralAmount
     );
    }

    function _getCollateralValue(
      uint256 collateral
    ) internal view returns (uint256) {

     int256 price =
        priceFeed.latestAnswer();

     require(
        price > 0,
        "Invalid price"
     );

     uint8 priceDecimals =
        priceFeed.decimals();

     uint256 normalizedPrice;

     if (priceDecimals < 18) {

        normalizedPrice =
            uint256(price) *
            10 ** (18 - priceDecimals);

     } else if (priceDecimals > 18) {

        normalizedPrice =
            uint256(price) /
            10 ** (priceDecimals - 18);

     } else {

        normalizedPrice =
            uint256(price);
     }

     return
        (collateral * normalizedPrice) /
        1e18;
    }

    function getMaxBorrowAmount(
     address borrower
    ) public view returns (uint256) {

     uint256 collateralValue =
        getCollateralValue(borrower);

     uint256 maxBorrowValue =
        (collateralValue * MAX_LTV) / 100;

     // Convert USD value from 18 decimals
     // to USDC's 6 decimals.
     uint256 maxBorrowAmount =
        maxBorrowValue / 1e12;

     return maxBorrowAmount;
    }

    function getHealthFactor(
       address borrower
    ) public view returns (uint256) {

     uint256 borrowedAmount =
        loans[borrower].borrowedAmount;

     if (borrowedAmount == 0) {
        return type(uint256).max;
     }

     uint256 collateralValue =
        getCollateralValue(borrower);

     uint256 maxBorrowValue =
        (
            collateralValue *
            MAX_LTV
        ) / 100;

     uint256 maxBorrowAmount =
        maxBorrowValue / 1e12;

     return
        (
            maxBorrowAmount *
            1e18
        ) / borrowedAmount;
    }

    function borrow(
    uint256 amount
    ) external {

     require(
        amount > 0,
        "Borrow amount must be greater than zero"
     );

     uint256 maxBorrowAmount =
        getMaxBorrowAmount(msg.sender);

     uint256 currentBorrowed =
        loans[msg.sender].borrowedAmount;

     require(
        currentBorrowed + amount <= maxBorrowAmount,
        "Borrow amount exceeds maximum LTV"
     );

     loans[msg.sender].borrowedAmount += amount;

     loans[msg.sender].startTime = block.timestamp;

     loans[msg.sender].active = true;

     usdc.mint(
        msg.sender,
        amount
     );

     emit Borrowed(
        msg.sender,
        amount
     );
    }

    function repay(
    uint256 amount
    ) external {

     require(
        amount > 0,
        "Repayment amount must be greater than zero"
     );

     uint256 borrowedAmount =
        loans[msg.sender].borrowedAmount;

     require(
        borrowedAmount > 0,
        "No active loan"
     );

     require(
        amount <= borrowedAmount,
        "Repayment exceeds borrowed amount"
     );

     bool success =
        usdc.transferFrom(
            msg.sender,
            address(this),
            amount
        );

     require(
        success,
        "USDC transfer failed"
     );

     loans[msg.sender].borrowedAmount -= amount;

     if (
        loans[msg.sender].borrowedAmount == 0
     ) {
        loans[msg.sender].active = false;
     }

     emit Repaid(
        msg.sender,
        amount
     );
    }

    function withdrawCollateral(
    uint256 amount
    ) external {

     require(
        amount > 0,
        "Withdrawal amount must be greater than zero"
     );

     uint256 currentCollateral =
        loans[msg.sender].collateralAmount;

     require(
        currentCollateral >= amount,
        "Insufficient collateral"
     );

     uint256 remainingCollateral =
        currentCollateral - amount;

     uint256 borrowedAmount =
        loans[msg.sender].borrowedAmount;

     if (borrowedAmount > 0) {

        uint256 remainingCollateralValue =
            _getCollateralValue(
                remainingCollateral
            );

        uint256 remainingMaxBorrow =
            (
                remainingCollateralValue *
                MAX_LTV
            ) / 100;

        remainingMaxBorrow =
            remainingMaxBorrow / 1e12;

        require(
            remainingMaxBorrow >= borrowedAmount,
            "Withdrawal would violate maximum LTV"
        );
     }

     loans[msg.sender].collateralAmount =
        remainingCollateral;

     (bool success, ) =
        payable(msg.sender).call{
            value: amount
        }("");

     require(
        success,
        "ETH transfer failed"
     );

     emit CollateralWithdrawn(
        msg.sender,
        amount
     );
    }

    function liquidate(
    address borrower
    ) external {

     require(
        borrower != address(0),
        "Invalid borrower"
     );

     uint256 borrowedAmount =
        loans[borrower].borrowedAmount;

     require(
        borrowedAmount > 0,
        "No active loan"
     );

     uint256 healthFactor =
        getHealthFactor(borrower);

     require(
        healthFactor < 1e18,
        "Loan is healthy"
     );

     uint256 debtValue =
        borrowedAmount * 1e12;

     uint256 debtWithBonus =
        (
            debtValue *
            (100 + LIQUIDATION_BONUS)
        ) / 100;

     int256 price =
        priceFeed.latestAnswer();

     require(
        price > 0,
        "Invalid price"
     );

     uint8 priceDecimals =
        priceFeed.decimals();

     uint256 normalizedPrice;

     if (priceDecimals < 18) {

        normalizedPrice =
            uint256(price) *
            10 ** (18 - priceDecimals);

     } else if (priceDecimals > 18) {

        normalizedPrice =
            uint256(price) /
            10 ** (priceDecimals - 18);

     } else {

        normalizedPrice =
            uint256(price);
     }

     uint256 collateralToSeize =
        (
            debtWithBonus *
            1e18
        ) / normalizedPrice;

     require(
        collateralToSeize <=
        loans[borrower].collateralAmount,
        "Insufficient collateral"
     );

     bool success =
        usdc.transferFrom(
            msg.sender,
            address(this),
            borrowedAmount
        );

     require(
        success,
        "USDC transfer failed"
     );

     loans[borrower].borrowedAmount = 0;

     loans[borrower].collateralAmount -=
        collateralToSeize;

     loans[borrower].active = false;

     (bool ethSuccess, ) =
        payable(msg.sender).call{
            value: collateralToSeize
        }("");

     require(
        ethSuccess,
        "ETH transfer failed"
     );

     emit Liquidated(
        borrower,
        msg.sender,
        borrowedAmount,
        collateralToSeize
     );
    }
}
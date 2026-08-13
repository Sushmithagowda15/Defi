// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

contract LendingPool is ReentrancyGuard {

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

    // 10% annual interest
    uint256 public constant INTEREST_RATE = 10;

    uint256 public constant YEAR =
        365 days;


    constructor(
        address _usdc,
        address _priceFeed
    ) {
        usdc = IERC20(_usdc);
        priceFeed = IPriceFeed(_priceFeed);
    }


    // =========================================================
    // EVENTS
    // =========================================================

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


    // =========================================================
    // COLLATERAL
    // =========================================================

    function depositCollateral()
        external
        payable
    {
        require(
            msg.value > 0,
            "Collateral must be greater than zero"
        );

        loans[msg.sender].collateralAmount +=
            msg.value;

        emit CollateralDeposited(
            msg.sender,
            msg.value
        );
    }


    function withdrawCollateral(
        uint256 amount
    ) external nonReentrant {

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

            uint256 currentDebt =
                getCurrentDebt(msg.sender);

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
                remainingMaxBorrow >= currentDebt,
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


    // =========================================================
    // COLLATERAL VALUE
    // =========================================================

    function getCollateralValue(
        address borrower
    )
        public
        view
        returns (uint256)
    {
        return _getCollateralValue(
            loans[borrower].collateralAmount
        );
    }


    function _getCollateralValue(
        uint256 collateral
    )
        internal
        view
        returns (uint256)
    {
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
            (
                collateral *
                normalizedPrice
            ) / 1e18;
    }


    // =========================================================
    // BORROW LIMIT
    // =========================================================

    function getMaxBorrowAmount(
        address borrower
    )
        public
        view
        returns (uint256)
    {
        uint256 collateralValue =
            getCollateralValue(borrower);

        uint256 maxBorrowValue =
            (
                collateralValue *
                MAX_LTV
            ) / 100;

        // USD 18 decimals -> USDC 6 decimals
        return maxBorrowValue / 1e12;
    }


    // =========================================================
    // INTEREST
    // =========================================================

    function getCurrentDebt(
        address borrower
    )
        public
        view
        returns (uint256)
    {
        uint256 principal =
            loans[borrower].borrowedAmount;

        if (principal == 0) {
            return 0;
        }

        uint256 elapsed =
            block.timestamp -
            loans[borrower].startTime;

        uint256 interest =
            (
                principal *
                INTEREST_RATE *
                elapsed
            ) /
            (100 * YEAR);

        return principal + interest;
    }


    // =========================================================
    // HEALTH FACTOR
    // =========================================================

    function getHealthFactor(
        address borrower
    )
        public
        view
        returns (uint256)
    {
        uint256 currentDebt =
            getCurrentDebt(borrower);

        if (currentDebt == 0) {
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
            ) /
            currentDebt;
    }


    // =========================================================
    // BORROW
    // =========================================================

    function borrow(
        uint256 amount
    ) external {

        require(
            amount > 0,
            "Borrow amount must be greater than zero"
        );

        uint256 maxBorrowAmount =
            getMaxBorrowAmount(msg.sender);

        uint256 currentDebt =
            getCurrentDebt(msg.sender);

        require(
            currentDebt + amount <=
            maxBorrowAmount,
            "Borrow amount exceeds maximum LTV"
        );

        loans[msg.sender].borrowedAmount +=
            amount;

        loans[msg.sender].startTime =
            block.timestamp;

        loans[msg.sender].active =
            true;

        usdc.mint(
            msg.sender,
            amount
        );

        emit Borrowed(
            msg.sender,
            amount
        );
    }


    // =========================================================
    // PARTIAL REPAYMENT
    // =========================================================

    function repay(
        uint256 amount
    ) external {

        require(
            amount > 0,
            "Repayment amount must be greater than zero"
        );

        uint256 principal =
            loans[msg.sender].borrowedAmount;

        require(
            principal > 0,
            "No active loan"
        );

        uint256 currentDebt =
            getCurrentDebt(msg.sender);

        require(
            amount <= currentDebt,
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

        uint256 remainingDebt =
            currentDebt - amount;

        loans[msg.sender].borrowedAmount =
            remainingDebt;

        if (remainingDebt == 0) {

            loans[msg.sender].active =
                false;

            loans[msg.sender].startTime =
                0;

        } else {

            loans[msg.sender].startTime =
                block.timestamp;
        }

        emit Repaid(
            msg.sender,
            amount
        );
    }


    // =========================================================
    // FULL REPAYMENT
    // =========================================================

    function repayAll()
        external
    {
        uint256 principal =
            loans[msg.sender].borrowedAmount;

        require(
            principal > 0,
            "No active loan"
        );

        // IMPORTANT:
        // Debt is calculated inside the same transaction.
        uint256 currentDebt =
            getCurrentDebt(msg.sender);

        bool success =
            usdc.transferFrom(
                msg.sender,
                address(this),
                currentDebt
            );

        require(
            success,
            "USDC transfer failed"
        );

        loans[msg.sender].borrowedAmount =
            0;

        loans[msg.sender].active =
            false;

        loans[msg.sender].startTime =
            0;

        emit Repaid(
            msg.sender,
            currentDebt
        );
    }


    // =========================================================
    // LIQUIDATION
    // =========================================================

    function liquidate(
        address borrower
    ) external nonReentrant {

        require(
            borrower != address(0),
            "Invalid borrower"
        );

        uint256 principal =
            loans[borrower].borrowedAmount;

        require(
            principal > 0,
            "No active loan"
        );

        // Calculate debt once at the beginning
        // of this transaction.
        uint256 currentDebt =
            getCurrentDebt(borrower);

        uint256 collateralValue =
            getCollateralValue(borrower);

        uint256 maxBorrowValue =
            (
                collateralValue *
                MAX_LTV
            ) / 100;

        uint256 maxBorrowAmount =
            maxBorrowValue / 1e12;

        uint256 healthFactor =
            (
                maxBorrowAmount *
                1e18
            ) /
            currentDebt;

        require(
            healthFactor < 1e18,
            "Loan is healthy"
        );


        // =====================================================
        // Calculate collateral seized
        // =====================================================

        uint256 debtValue =
            currentDebt * 1e12;

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
            ) /
            normalizedPrice;

        require(
            collateralToSeize <=
            loans[borrower].collateralAmount,
            "Insufficient collateral"
        );


        // =====================================================
        // Liquidator pays current debt
        // =====================================================

        bool success =
            usdc.transferFrom(
                msg.sender,
                address(this),
                currentDebt
            );

        require(
            success,
            "USDC transfer failed"
        );


        // =====================================================
        // Update loan
        // =====================================================

        loans[borrower].borrowedAmount =
            0;

        loans[borrower].collateralAmount -=
            collateralToSeize;

        loans[borrower].active =
            false;

        loans[borrower].startTime =
            0;


        // =====================================================
        // Send seized ETH to liquidator
        // =====================================================

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
            currentDebt,
            collateralToSeize
        );
    }
}
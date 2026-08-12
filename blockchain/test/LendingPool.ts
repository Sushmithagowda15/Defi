import { expect } from "chai";
import { network } from "hardhat";

describe("LendingPool", function () {

    async function deployLendingPool() {
      const { ethers } = await network.create();

      const [user] = await ethers.getSigners();

      // Deploy MockUSDC
      const mockUSDC =
         await ethers.deployContract("MockUSDC");

      // Deploy MockPriceFeed with ETH = $4,000
      const initialPrice =
        4000n * 10n ** 8n;

      const priceFeed =
        await ethers.deployContract(
             "MockPriceFeed",
             [initialPrice]
        );

      // Deploy LendingPool with both addresses
      const lendingPool =
        await ethers.deployContract(
            "LendingPool",
            [
                await mockUSDC.getAddress(),
                await priceFeed.getAddress()
            ]
        );
 
      return {
        ethers,
        user,
        lendingPool,
        mockUSDC,
        priceFeed
      };
    }


    // =========================
    // COLLATERAL DEPOSIT TESTS
    // =========================

    it("should allow a user to deposit ETH as collateral", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        const depositAmount =
            ethers.parseEther("2");

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: depositAmount
            });

        const loan =
            await lendingPool.loans(user.address);

        expect(loan.collateralAmount)
            .to.equal(depositAmount);
    });


    it("should reject a zero ETH deposit", async function () {

        const { user, lendingPool } =
            await deployLendingPool();

        await expect(
            lendingPool
                .connect(user)
                .depositCollateral({
                    value: 0
                })
        ).to.be.revertedWith(
            "Collateral must be greater than zero"
        );
    });


    it("should accumulate multiple collateral deposits", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        const firstDeposit =
            ethers.parseEther("1");

        const secondDeposit =
            ethers.parseEther("2");

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: firstDeposit
            });

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: secondDeposit
            });

        const loan =
            await lendingPool.loans(user.address);

        expect(loan.collateralAmount)
            .to.equal(
                ethers.parseEther("3")
            );
    });


    it("should emit CollateralDeposited event", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        const depositAmount =
            ethers.parseEther("2");

        await expect(
            lendingPool
                .connect(user)
                .depositCollateral({
                    value: depositAmount
                })
        )
            .to.emit(
                lendingPool,
                "CollateralDeposited"
            )
            .withArgs(
                user.address,
                depositAmount
            );
    });


    // =========================
    // COLLATERAL WITHDRAWAL TESTS
    // =========================

    it("should allow a user to withdraw part of their collateral", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        const depositAmount =
            ethers.parseEther("5");

        const withdrawalAmount =
            ethers.parseEther("2");

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: depositAmount
            });

        await lendingPool
            .connect(user)
            .withdrawCollateral(
                withdrawalAmount
            );

        const loan =
            await lendingPool.loans(user.address);

        expect(loan.collateralAmount)
            .to.equal(
                ethers.parseEther("3")
            );
    });


    it("should reject withdrawal greater than available collateral", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: ethers.parseEther("1")
            });

        await expect(
            lendingPool
                .connect(user)
                .withdrawCollateral(
                    ethers.parseEther("2")
                )
        ).to.be.revertedWith(
            "Insufficient collateral"
        );
    });


    it("should reject a zero collateral withdrawal", async function () {

        const { user, lendingPool } =
            await deployLendingPool();

        await expect(
            lendingPool
                .connect(user)
                .withdrawCollateral(0)
        ).to.be.revertedWith(
            "Withdrawal amount must be greater than zero"
        );
    });


    it("should emit CollateralWithdrawn event", async function () {

        const { ethers, user, lendingPool } =
            await deployLendingPool();

        const depositAmount =
            ethers.parseEther("2");

        const withdrawalAmount =
            ethers.parseEther("1");

        await lendingPool
            .connect(user)
            .depositCollateral({
                value: depositAmount
            });

        await expect(
            lendingPool
                .connect(user)
                .withdrawCollateral(
                    withdrawalAmount
                )
        )
            .to.emit(
                lendingPool,
                "CollateralWithdrawn"
            )
            .withArgs(
                user.address,
                withdrawalAmount
            );
    });

    it("should calculate the USD value of collateral", async function () {

      const { ethers, user, lendingPool } =
        await deployLendingPool();

      const depositAmount =
        ethers.parseEther("2");

      await lendingPool
        .connect(user)
        .depositCollateral({
            value: depositAmount
        });

      const collateralValue =
        await lendingPool.getCollateralValue(
            user.address
        );

      const expectedValue =
        ethers.parseEther("8000");

      expect(collateralValue)
        .to.equal(expectedValue);
    });

    it("should calculate the maximum borrow amount based on LTV", async function () {

     const { ethers, user, lendingPool } =
        await deployLendingPool();

     const depositAmount =
        ethers.parseEther("2");

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: depositAmount
        });

     const maxBorrowAmount =
        await lendingPool.getMaxBorrowAmount(
            user.address
        );

     const expectedBorrowAmount =
        5600n * 10n ** 6n;

     expect(maxBorrowAmount)
        .to.equal(expectedBorrowAmount);
    });

    it("should allow a user to borrow USDC within the maximum LTV", async function () {

     const {
        ethers,
        user,
        lendingPool,
        mockUSDC
     } = await deployLendingPool();

     const depositAmount =
        ethers.parseEther("2");

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: depositAmount
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     const balanceBefore =
        await mockUSDC.balanceOf(
            user.address
        );

     await lendingPool
        .connect(user)
        .borrow(
            borrowAmount
        );

     const loan =
        await lendingPool.loans(
            user.address
        );

     const balanceAfter =
        await mockUSDC.balanceOf(
            user.address
        );

     expect(loan.borrowedAmount)
        .to.equal(
            borrowAmount
        );

     expect(balanceAfter)
        .to.equal(
            balanceBefore + borrowAmount
        );
    });

    it("should emit Borrowed event", async function () {

     const {
        ethers,
        user,
        lendingPool
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     await expect(
        lendingPool
            .connect(user)
            .borrow(
                borrowAmount
            )
     )
        .to.emit(
            lendingPool,
            "Borrowed"
        )
        .withArgs(
            user.address,
            borrowAmount
        );
    });

    it("should reject a zero borrow amount", async function () {

     const {
        ethers,
        user,
        lendingPool
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     await expect(
        lendingPool
            .connect(user)
            .borrow(0)
     ).to.be.revertedWith(
        "Borrow amount must be greater than zero"
     );
    });

    it("should reject borrowing above the maximum LTV", async function () {

     const {
        ethers,
        user,
        lendingPool
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     const excessiveBorrow =
        6000n * 10n ** 6n;

     await expect(
        lendingPool
            .connect(user)
            .borrow(
                excessiveBorrow
            )
     ).to.be.revertedWith(
        "Borrow amount exceeds maximum LTV"
     );
    });

    it("should allow a user to repay part of their loan", async function () {

     const {
        ethers,
        user,
        lendingPool,
        mockUSDC
     } = await deployLendingPool();

     const depositAmount =
        ethers.parseEther("2");

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: depositAmount
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     await lendingPool
        .connect(user)
        .borrow(
            borrowAmount
        );

     const repayAmount =
        1000n * 10n ** 6n;

     await mockUSDC
        .connect(user)
        .approve(
            await lendingPool.getAddress(),
            repayAmount
        );

     await lendingPool
        .connect(user)
        .repay(
            repayAmount
        );

     const loan =
        await lendingPool.loans(
            user.address
        );

     expect(loan.borrowedAmount)
        .to.equal(
            3000n * 10n ** 6n
        );

     expect(loan.active)
        .to.equal(true);
    });

    it("should allow a user to fully repay their loan", async function () {

     const {
        ethers,
        user,
        lendingPool,
        mockUSDC
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     await lendingPool
        .connect(user)
        .borrow(
            borrowAmount
        );

     await mockUSDC
        .connect(user)
        .approve(
            await lendingPool.getAddress(),
            borrowAmount
        );

     await lendingPool
        .connect(user)
        .repay(
            borrowAmount
        );

     const loan =
        await lendingPool.loans(
            user.address
        );

     expect(loan.borrowedAmount)
        .to.equal(0);

     expect(loan.active)
        .to.equal(false);
    });

    it("should reject a zero repayment", async function () {

     const {
        ethers,
        user,
        lendingPool
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     await expect(
        lendingPool
            .connect(user)
            .repay(0)
     ).to.be.revertedWith(
        "Repayment amount must be greater than zero"
     );
    });

    it("should reject repayment greater than the borrowed amount", async function () {

     const {
        ethers,
        user,
        lendingPool,
        mockUSDC
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     await lendingPool
        .connect(user)
        .borrow(
            borrowAmount
        );

     const excessiveRepayment =
        5000n * 10n ** 6n;

     await mockUSDC
        .connect(user)
        .approve(
            await lendingPool.getAddress(),
            excessiveRepayment
        );

     await expect(
        lendingPool
            .connect(user)
            .repay(
                excessiveRepayment
            )
     ).to.be.revertedWith(
        "Repayment exceeds borrowed amount"
     );
    });

    it("should emit Repaid event", async function () {

     const {
        ethers,
        user,
        lendingPool,
        mockUSDC
     } = await deployLendingPool();

     await lendingPool
        .connect(user)
        .depositCollateral({
            value: ethers.parseEther("2")
        });

     const borrowAmount =
        4000n * 10n ** 6n;

     await lendingPool
        .connect(user)
        .borrow(
            borrowAmount
        );

     const repayAmount =
        1000n * 10n ** 6n;

     await mockUSDC
        .connect(user)
        .approve(
            await lendingPool.getAddress(),
            repayAmount
        );

     await expect(
        lendingPool
            .connect(user)
            .repay(
                repayAmount
            )
     )
        .to.emit(
            lendingPool,
            "Repaid"
        )
        .withArgs(
            user.address,
            repayAmount
        );
    });

});
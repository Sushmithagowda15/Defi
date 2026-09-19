import { expect } from "chai";
import { network } from "hardhat";

describe("LendingPool", function () {

    async function deployLendingPool() {

        const { ethers } =
            await network.create();

        const [user] =
            await ethers.getSigners();

        // Deploy MockUSDC
        const mockUSDC =
            await ethers.deployContract(
                "MockUSDC"
            );

        // Deploy MockPriceFeed with ETH = $4,000
        const initialPrice =
            4000n * 10n ** 8n;

        const priceFeed =
            await ethers.deployContract(
                "MockPriceFeed",
                [initialPrice]
            );

        // Deploy LendingPool
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


    // =========================================================
    // COLLATERAL DEPOSIT TESTS
    // =========================================================

    it(
        "should allow a user to deposit ETH as collateral",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

            const depositAmount =
                ethers.parseEther("2");

            await lendingPool
                .connect(user)
                .depositCollateral({
                    value: depositAmount
                });

            const loan =
                await lendingPool.loans(
                    user.address
                );

            expect(loan.collateralAmount)
                .to.equal(
                    depositAmount
                );
        }
    );


    it(
        "should reject a zero ETH deposit",
        async function () {

            const {
                user,
                lendingPool
            } = await deployLendingPool();

            await expect(
                lendingPool
                    .connect(user)
                    .depositCollateral({
                        value: 0
                    })
            ).to.be.revertedWith(
                "Collateral must be greater than zero"
            );
        }
    );


    it(
        "should accumulate multiple collateral deposits",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
                await lendingPool.loans(
                    user.address
                );

            expect(loan.collateralAmount)
                .to.equal(
                    ethers.parseEther("3")
                );
        }
    );


    it(
        "should emit CollateralDeposited event",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
        }
    );


    // =========================================================
    // COLLATERAL WITHDRAWAL TESTS
    // =========================================================

    it(
        "should allow a user to withdraw part of their collateral",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
                await lendingPool.loans(
                    user.address
                );

            expect(loan.collateralAmount)
                .to.equal(
                    ethers.parseEther("3")
                );
        }
    );


    it(
        "should reject withdrawal greater than available collateral",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
        }
    );


    it(
        "should reject a zero collateral withdrawal",
        async function () {

            const {
                user,
                lendingPool
            } = await deployLendingPool();

            await expect(
                lendingPool
                    .connect(user)
                    .withdrawCollateral(0)
            ).to.be.revertedWith(
                "Withdrawal amount must be greater than zero"
            );
        }
    );


    it(
        "should emit CollateralWithdrawn event",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
        }
    );


    it(
        "should reject withdrawal that would violate maximum LTV",
        async function () {

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

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            await expect(
                lendingPool
                    .connect(user)
                    .withdrawCollateral(
                        ethers.parseEther("1")
                    )
            ).to.be.revertedWith(
                "Withdrawal would violate maximum LTV"
            );
        }
    );


    it(
        "should allow withdrawal while remaining within maximum LTV",
        async function () {

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
                2000n * 10n ** 6n;

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            await lendingPool
                .connect(user)
                .withdrawCollateral(
                    ethers.parseEther("0.5")
                );

            const loan =
                await lendingPool.loans(
                    user.address
                );

            expect(loan.collateralAmount)
                .to.equal(
                    ethers.parseEther("1.5")
                );

            expect(loan.borrowedAmount)
                .to.equal(
                    borrowAmount
                );
        }
    );


    it(
        "should allow collateral withdrawal after full repayment",
        async function () {

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

            /*
             * Approve a very large amount.
             * repayAll() calculates the exact debt
             * inside the same transaction.
             */
            await mockUSDC
                .connect(user)
                .approve(
                    await lendingPool.getAddress(),
                    ethers.MaxUint256
                );

            await lendingPool
                .connect(user)
                .repayAll();

            await lendingPool
                .connect(user)
                .withdrawCollateral(
                    ethers.parseEther("1")
                );

            const loan =
                await lendingPool.loans(
                    user.address
                );

            expect(loan.collateralAmount)
                .to.equal(
                    ethers.parseEther("1")
                );

            expect(loan.borrowedAmount)
                .to.equal(0);

            expect(loan.active)
                .to.equal(false);
        }
    );


    // =========================================================
    // PRICE / LTV TESTS
    // =========================================================

    it(
        "should calculate the USD value of collateral",
        async function () {

            const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

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
                .to.equal(
                    expectedValue
                );
        }
    );


    it(
        "should calculate the maximum borrow amount based on LTV",
        async function () {

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

            const maxBorrowAmount =
                await lendingPool.getMaxBorrowAmount(
                    user.address
                );

            const expectedBorrowAmount =
                5600n * 10n ** 6n;

            expect(maxBorrowAmount)
                .to.equal(
                    expectedBorrowAmount
                );
        }
    );


    // =========================================================
    // BORROW TESTS
    // =========================================================

    it(
        "should allow a user to borrow USDC within the maximum LTV",
        async function () {

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
                    balanceBefore +
                    borrowAmount
                );
        }
    );


    it(
        "should emit Borrowed event",
        async function () {

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
        }
    );


    it(
        "should reject a zero borrow amount",
        async function () {

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
        }
    );


    it(
        "should reject borrowing above the maximum LTV",
        async function () {

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
        }
    );

    it(
        "should include accrued interest when borrowing again",
        async function () {

            const {
              ethers,
              user,
              lendingPool
            } = await deployLendingPool();

            // Deposit 2 ETH as collateral
            await lendingPool
              .connect(user)
              .depositCollateral({
                value: ethers.parseEther("2")
              });

            // First borrow: 4000 USDC
            const firstBorrow =
              4000n * 10n ** 6n;

            await lendingPool
              .connect(user)
              .borrow(firstBorrow);

            // Move time forward by 1 year
            await ethers.provider.send(
              "evm_increaseTime",
              [365 * 24 * 60 * 60]
            );

            await ethers.provider.send(
              "evm_mine"
            );

            // After 1 year at 10% interest:
            // 4000 USDC -> 4400 USDC
            const currentDebt =
               await lendingPool.getCurrentDebt(
                user.address
              );

            expect(currentDebt)
              .to.equal(
                4400n * 10n ** 6n
              );

            // Borrow another 100 USDC
            const secondBorrow =
              100n * 10n ** 6n;

            await lendingPool
              .connect(user)
              .borrow(secondBorrow);

           // New debt should include the accrued interest:
           // 4400 + 100 = 4500 USDC
            const newDebt =
              await lendingPool.getCurrentDebt(
                user.address
              );

            expect(newDebt)
               .to.be.greaterThanOrEqual(
                 4500n * 10n ** 6n
               );

            expect(newDebt)
              .to.be.lessThan(
                4501n * 10n ** 6n
               );
        }
    );


    // =========================================================
    // REPAYMENT TESTS
    // =========================================================

    it(
        "should allow a user to repay part of their loan",
        async function () {

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
                    ethers.MaxUint256
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

            /*
             * After partial repayment, the remaining
             * principal/debt should be greater than
             * 3000 USDC because of interest.
             */
            expect(loan.borrowedAmount)
                .to.be.greaterThan(
                    3000n * 10n ** 6n
                );

            expect(loan.borrowedAmount)
                .to.be.lessThan(
                    3001n * 10n ** 6n
                );

            expect(loan.active)
                .to.equal(true);
        }
    );


    it(
        "should allow a user to fully repay their loan",
        async function () {

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

            /*
             * repayAll() calculates the exact debt
             * inside the transaction.
             */
            await mockUSDC
                .connect(user)
                .approve(
                    await lendingPool.getAddress(),
                    ethers.MaxUint256
                );

            await lendingPool
                .connect(user)
                .repayAll();

            const loan =
                await lendingPool.loans(
                    user.address
                );

            expect(loan.borrowedAmount)
                .to.equal(0);

            expect(loan.active)
                .to.equal(false);
        }
    );


    it(
        "should reject a zero repayment",
        async function () {

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
        }
    );


    it(
        "should reject repayment greater than the borrowed amount",
        async function () {

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
                    ethers.MaxUint256
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
        }
    );


    it(
        "should emit Repaid event",
        async function () {

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
                    ethers.MaxUint256
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
        }
    );


    // =========================================================
    // HEALTH FACTOR TESTS
    // =========================================================

    it(
        "should calculate a healthy loan health factor",
        async function () {

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

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            const healthFactor =
                await lendingPool.getHealthFactor(
                    user.address
                );

            /*
             * The theoretical value is 1.4.
             * Because interest may already have accrued
             * by a tiny amount, use a small tolerance.
             */
            expect(healthFactor)
                .to.be.greaterThan(
                    1390000000000000000n
                );

            expect(healthFactor)
                .to.be.lessThanOrEqual(
                    1400000000000000000n
                );
        }
    );


    it(
        "should return maximum health factor when there is no debt",
        async function () {

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

            const healthFactor =
                await lendingPool.getHealthFactor(
                    user.address
                );

            expect(healthFactor)
                .to.equal(
                    ethers.MaxUint256
                );
        }
    );


    it(
        "should become unhealthy when the ETH price falls",
        async function () {

            const {
                ethers,
                user,
                lendingPool,
                priceFeed
            } = await deployLendingPool();

            await lendingPool
                .connect(user)
                .depositCollateral({
                    value: ethers.parseEther("2")
                });

            const borrowAmount =
                5000n * 10n ** 6n;

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            const healthyFactor =
                await lendingPool.getHealthFactor(
                    user.address
                );

            expect(healthyFactor)
                .to.be.greaterThan(
                    ethers.parseEther("1")
                );

            const newPrice =
                3000n * 10n ** 8n;

            await priceFeed.setPrice(
                newPrice
            );

            const unhealthyFactor =
                await lendingPool.getHealthFactor(
                    user.address
                );

            expect(unhealthyFactor)
                .to.be.lessThan(
                    ethers.parseEther("1")
                );
        }
    );


    // =========================================================
    // LIQUIDATION TESTS
    // =========================================================

    it(
        "should reject liquidation of a healthy loan",
        async function () {

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

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            await expect(
                lendingPool
                    .connect(user)
                    .liquidate(
                        user.address
                    )
            ).to.be.revertedWith(
                "Loan is healthy"
            );
        }
    );


    it(
        "should liquidate an unhealthy loan",
        async function () {

            const {
                ethers,
                user,
                lendingPool,
                mockUSDC,
                priceFeed
            } = await deployLendingPool();

            const [, liquidator] =
                await ethers.getSigners();

            await lendingPool
                .connect(user)
                .depositCollateral({
                    value: ethers.parseEther("2")
                });

            const borrowAmount =
                5000n * 10n ** 6n;

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            // ETH price falls from $4,000 to $3,000
            await priceFeed.setPrice(
                3000n * 10n ** 8n
            );

            const healthFactor =
                await lendingPool.getHealthFactor(
                    user.address
                );

            expect(healthFactor)
                .to.be.lessThan(
                    ethers.parseEther("1")
                );

            /*
             * Give liquidator more than enough USDC.
             *
             * We deliberately use MaxUint256 approval because
             * the exact debt can change slightly with timestamp.
             */
            await mockUSDC.mint(
                liquidator.address,
                6000n * 10n ** 6n
            );

            await mockUSDC
                .connect(liquidator)
                .approve(
                    await lendingPool.getAddress(),
                    ethers.MaxUint256
                );

            await lendingPool
                .connect(liquidator)
                .liquidate(
                    user.address
                );

            const loan =
                await lendingPool.loans(
                    user.address
                );

            expect(loan.borrowedAmount)
                .to.equal(0);

            expect(loan.collateralAmount)
                .to.be.lessThan(
                    ethers.parseEther("2")
                );

            expect(loan.collateralAmount)
                .to.be.greaterThan(0);

            expect(loan.active)
                .to.equal(false);
        }
    );


    it(
        "should emit Liquidated event",
        async function () {

            const {
                ethers,
                user,
                lendingPool,
                mockUSDC,
                priceFeed
            } = await deployLendingPool();

            const [, liquidator] =
                await ethers.getSigners();

            await lendingPool
                .connect(user)
                .depositCollateral({
                    value: ethers.parseEther("2")
                });

            const borrowAmount =
                5000n * 10n ** 6n;

            await lendingPool
                .connect(user)
                .borrow(
                    borrowAmount
                );

            await priceFeed.setPrice(
                3000n * 10n ** 8n
            );

            /*
             * Give the liquidator enough USDC.
             */
            await mockUSDC.mint(
                liquidator.address,
                6000n * 10n ** 6n
            );

            await mockUSDC
                .connect(liquidator)
                .approve(
                    await lendingPool.getAddress(),
                    ethers.MaxUint256
                );

            /*
             * Don't calculate currentDebt before the
             * liquidation transaction.
             *
             * The contract itself calculates the exact
             * debt inside liquidate().
             *
             * Instead, wait for the transaction and inspect
             * the emitted Liquidated event.
             */
            const tx =
                await lendingPool
                    .connect(liquidator)
                    .liquidate(
                        user.address
                    );

            const receipt =
                await tx.wait();

            expect(receipt)
                .to.not.equal(null);

            /*
             * Find Liquidated event.
             */
            const liquidatedEvent =
                receipt!.logs.find(
                    (log: any) => {

                        try {

                            const parsed =
                                lendingPool.interface.parseLog(
                                    log
                                );

                            return (
                                parsed?.name ===
                                "Liquidated"
                            );

                        } catch {
                            return false;
                        }
                    }
                );

            expect(liquidatedEvent)
                .to.not.equal(undefined);

            const parsedEvent =
                lendingPool.interface.parseLog(
                    liquidatedEvent!
                );

            expect(parsedEvent)
                .to.not.equal(null);

            expect(parsedEvent!.args[0])
                .to.equal(
                    user.address
                );

            expect(parsedEvent!.args[1])
                .to.equal(
                    liquidator.address
                );

            expect(parsedEvent!.args[2])
                .to.be.greaterThan(
                    borrowAmount
                );

            expect(parsedEvent!.args[3])
                .to.be.greaterThan(0);
        }
    );

    it(
       "should block a reentrancy attack during collateral withdrawal",
       async function () {

             const {
                ethers,
                user,
                lendingPool
            } = await deployLendingPool();

            const attacker =
                await ethers.deployContract(
                  "ReentrantAttacker",
                  [
                    await lendingPool.getAddress()
                  ]
                );

            const depositAmount =
                ethers.parseEther("2");

            // Deposit ETH through attacker contract
            await attacker
                .connect(user)
                .deposit({
                    value: depositAmount
                });

            // Try to withdraw through attacker contract
            await expect(
                attacker
                    .connect(user)
                    .attack(
                      ethers.parseEther("1")
                    )
            ).to.be.revert(ethers);
        }
    );

});
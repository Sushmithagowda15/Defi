import { expect } from "chai";
import { network } from "hardhat";

describe("LendingPool", function () {

    async function deployLendingPool() {
        const { ethers } = await network.create();

        const [user] = await ethers.getSigners();

        const lendingPool =
            await ethers.deployContract("LendingPool");

        return {
            ethers,
            user,
            lendingPool
        };
    }

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

});
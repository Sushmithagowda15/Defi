import { expect } from "chai";
import { network } from "hardhat";

describe("LendingPool", function () {

    it("should allow a user to deposit ETH as collateral", async function () {

        const { ethers } = await network.create();

        const [user] = await ethers.getSigners();

        const lendingPool =
            await ethers.deployContract("LendingPool");

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

});
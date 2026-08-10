import { expect } from "chai";
import { network } from "hardhat";

describe("MockUSDC", function () {

    it("should give the deployer 1,000,000 mUSDC", async function () {

        const { ethers } = await network.create();

        const [deployer] = await ethers.getSigners();

        const mockUSDC =
            await ethers.deployContract("MockUSDC");

        const balance =
            await mockUSDC.balanceOf(deployer.address);

        expect(balance)
            .to.equal(
                1_000_000n * 10n ** 6n
            );
    });


    it("should use 6 decimals", async function () {

        const { ethers } = await network.create();

        const mockUSDC =
            await ethers.deployContract("MockUSDC");

        expect(
            await mockUSDC.decimals()
        ).to.equal(6);
    });


    it("should allow minting tokens", async function () {

        const { ethers } = await network.create();

        const [deployer, user] =
            await ethers.getSigners();

        const mockUSDC =
            await ethers.deployContract("MockUSDC");

        const mintAmount =
            5_000n * 10n ** 6n;

        await mockUSDC.mint(
            user.address,
            mintAmount
        );

        expect(
            await mockUSDC.balanceOf(user.address)
        ).to.equal(mintAmount);
    });

});
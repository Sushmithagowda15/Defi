import { expect } from "chai";
import { network } from "hardhat";

describe("MockPriceFeed", function () {

    it("should return the initial ETH price", async function () {

        const { ethers } = await network.create();

        const initialPrice =
            4000n * 10n ** 8n;

        const priceFeed =
            await ethers.deployContract(
                "MockPriceFeed",
                [initialPrice]
            );

        expect(
            await priceFeed.latestAnswer()
        ).to.equal(initialPrice);
    });


    it("should use 8 decimals", async function () {

        const { ethers } = await network.create();

        const priceFeed =
            await ethers.deployContract(
                "MockPriceFeed",
                [4000n * 10n ** 8n]
            );

        expect(
            await priceFeed.decimals()
        ).to.equal(8);
    });


    it("should allow the price to be updated", async function () {

        const { ethers } = await network.create();

        const priceFeed =
            await ethers.deployContract(
                "MockPriceFeed",
                [4000n * 10n ** 8n]
            );

        const newPrice =
            3000n * 10n ** 8n;

        await priceFeed.setPrice(newPrice);

        expect(
            await priceFeed.latestAnswer()
        ).to.equal(newPrice);
    });


    it("should reject a zero price", async function () {

        const { ethers } = await network.create();

        const priceFeed =
            await ethers.deployContract(
                "MockPriceFeed",
                [4000n * 10n ** 8n]
            );

        await expect(
            priceFeed.setPrice(0)
        ).to.be.revertedWith(
            "Price must be greater than zero"
        );
    });

});
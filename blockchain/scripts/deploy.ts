import fs from "node:fs";
import path from "node:path";
import { network } from "hardhat";

async function main() {

    const { ethers } =
        await network.create();

    const [deployer] =
        await ethers.getSigners();

    console.log(
        "Deploying contracts with:",
        deployer.address
    );


    // =====================================================
    // 1. Deploy MockUSDC
    // =====================================================

    const mockUSDC =
        await ethers.deployContract(
            "MockUSDC"
        );

    await mockUSDC.waitForDeployment();

    const mockUSDCAddress =
        await mockUSDC.getAddress();

    console.log(
        "MockUSDC:",
        mockUSDCAddress
    );


    // =====================================================
    // 2. Deploy MockPriceFeed
    // =====================================================

    // ETH = $4,000
    // MockPriceFeed uses 8 decimals.
    const initialPrice =
        4000n * 10n ** 8n;

    const priceFeed =
        await ethers.deployContract(
            "MockPriceFeed",
            [initialPrice]
        );

    await priceFeed.waitForDeployment();

    const priceFeedAddress =
        await priceFeed.getAddress();

    console.log(
        "MockPriceFeed:",
        priceFeedAddress
    );


    // =====================================================
    // 3. Deploy LendingPool
    // =====================================================

    const lendingPool =
        await ethers.deployContract(
            "LendingPool",
            [
                mockUSDCAddress,
                priceFeedAddress
            ]
        );

    await lendingPool.waitForDeployment();

    const lendingPoolAddress =
        await lendingPool.getAddress();

    console.log(
        "LendingPool:",
        lendingPoolAddress
    );


    // =====================================================
    // 4. Save deployment addresses
    // =====================================================

    const networkInfo =
        await ethers.provider.getNetwork();

    const deploymentData = {

        network:
            networkInfo.name,

        chainId:
            networkInfo.chainId.toString(),

        deployer:
            deployer.address,

        MockUSDC:
            mockUSDCAddress,

        MockPriceFeed:
            priceFeedAddress,

        LendingPool:
            lendingPoolAddress
    };


    const deploymentDirectory =
        path.join(
            process.cwd(),
            "deployments"
        );


    fs.mkdirSync(
        deploymentDirectory,
        {
            recursive: true
        }
    );


    fs.writeFileSync(
        path.join(
            deploymentDirectory,
            "addresses.json"
        ),
        JSON.stringify(
            deploymentData,
            null,
            2
        )
    );


    console.log("");
    console.log(
        "================================="
    );

    console.log(
        "Deployment successful!"
    );

    console.log(
        "================================="
    );

    console.log(
        "Network:",
        networkInfo.name
    );

    console.log(
        "Chain ID:",
        networkInfo.chainId.toString()
    );

    console.log(
        "Deployer:",
        deployer.address
    );

    console.log(
        "MockUSDC:",
        mockUSDCAddress
    );

    console.log(
        "MockPriceFeed:",
        priceFeedAddress
    );

    console.log(
        "LendingPool:",
        lendingPoolAddress
    );

    console.log(
        "Deployment addresses saved to:",
        "deployments/addresses.json"
    );

    console.log(
        "================================="
    );
}


main().catch(
    (error) => {

        console.error(error);

        process.exitCode = 1;
    }
);
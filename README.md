# DeFi Lending DApp with AI-Based Risk Analysis

A decentralized finance (DeFi) lending application that enables users to deposit ETH as collateral, borrow USDC, manage repayments, and monitor lending risk through a modern web interface.

The project combines blockchain smart contracts, wallet integration, market data, and AI-assisted risk analysis to demonstrate core decentralized lending functionality.

## Key Features

- **Wallet Connection:** Connect a Web3 wallet using MetaMask.
- **ETH Collateral:** Deposit ETH into the lending protocol.
- **USDC Borrowing:** Borrow USDC against deposited collateral.
- **Loan Repayment:** Repay borrowed USDC and manage outstanding loans.
- **Portfolio Dashboard:** View lending activity and portfolio information.
- **Market Overview:** Explore market-related information.
- **Risk Analysis:** Review borrowing risk and loan health information with AI-assisted analysis.
- **AI Assistant Chatbot:** Interact with an integrated chatbot for assistance.
- **Transaction History:** View lending and borrowing transactions.
- **Blockchain Integration:** Interact with a deployed lending pool contract on the Sepolia test network.
- **Price Feed Integration:** Use Chainlink price feeds for supported on-chain price data.

## Technology Stack

**Frontend**
- React
- JavaScript
- HTML5
- CSS3
- Vite

**Blockchain**
- Solidity
- Ethereum
- Sepolia test network
- MetaMask
- Smart contract integration
- Chainlink price feeds

**Additional Integrations**
- AI-assisted risk analysis
- AI assistant chatbot
- Backend API integration for risk analysis

## Application Modules

| Module | Description |
|---|---|
| Dashboard | Overview of lending activity and protocol information |
| Lend | Deposit ETH as collateral |
| Borrow | Borrow USDC against collateral |
| Repay | Repay outstanding loans |
| Markets | View market information |
| Portfolio | Review portfolio information |
| Risk Analysis | Analyze borrowing risk and loan health |
| Transactions | Review transaction activity |
| AI Assistant | Chat-based assistance within the application |

## Smart Contract

The lending pool contract is deployed on the Sepolia test network.

**LendingPool contract address:**

`0xf49D97Eb1fa32aFA40A9d8Bf717E258573bF76F0`

Network: Sepolia Testnet

> This is a test-network project for educational and demonstration purposes. Verify the deployed contract and its supported functions before interacting with it.

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- Visual Studio Code or another code editor
- MetaMask browser extension
- Sepolia test ETH for supported blockchain interactions

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Sushmithagowda15/Defi.git
   ```

2. Navigate to the frontend directory:

   ```bash
   cd Defi/frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in the terminal.

### Configuration

Before using blockchain or risk-analysis features, verify the contract configuration, wallet network, and backend API configuration required by the application.

Never commit private keys, wallet seed phrases, API secrets, or other credentials to GitHub.

## My Contribution

**Role: Frontend Developer**

- Developed and improved the user interface for the DeFi lending application.
- Built dashboard and lending-related pages, including Lend, Borrow, Repay, Markets, Portfolio, Risk Analysis, and Transactions.
- Worked on MetaMask wallet integration and frontend interaction with the lending pool smart contract.
- Improved page layouts, styling, and navigation.
- Collaborated with a teammate on integrating blockchain functionality, AI-assisted risk analysis, and the chatbot.

## Future Enhancements

- Expand automated testing for lending and borrowing workflows.
- Improve error handling and transaction-status feedback.
- Enhance risk-analysis visualizations and reporting.
- Improve responsive design and accessibility.
- Add more comprehensive technical documentation.

## Disclaimer

This project is intended for academic and educational purposes. It has not been presented as a production-ready financial service. Test-network deployments and experimental risk-analysis features should not be used as the basis for real financial decisions.

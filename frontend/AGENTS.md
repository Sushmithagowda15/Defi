# DeFi Lending DApp — Frontend Agent Instructions

## 1. Project Overview

This is the frontend of a major academic DeFi Lending DApp project.

The application is a decentralized lending platform where users can:

- Connect their MetaMask wallet
- Supply ETH as collateral
- Borrow against their ETH collateral
- Repay borrowed funds
- Withdraw collateral
- View their lending position
- View markets
- View portfolio information
- View transactions
- View risk analysis

The project is intended to be a substantial VTU engineering project, not a simple demo.

The frontend must remain connected to the existing blockchain and backend architecture.

---

# 2. PRIMARY OBJECTIVE

The current objective is:

## REDESIGN AND IMPROVE THE FRONTEND UI/UX.

The existing application functionality is already being developed.

The redesign should make the application look:

- Professional
- Modern
- Clean
- Premium
- Trustworthy
- Similar in quality to a modern DeFi/fintech dashboard
- Suitable for an academic major project demonstration

The UI should NOT look like a basic student CRUD application.

---

# 3. CRITICAL RULE — DO NOT BREAK FUNCTIONALITY

Before making any changes, inspect the existing project and understand how the application currently works.

The following must NOT be changed unless explicitly requested:

### Blockchain functionality

Do NOT modify:

- Smart contract address
- Contract ABI
- Contract interaction logic
- ethers.js configuration
- MetaMask connection logic
- Transaction submission logic
- Transaction confirmation logic
- ETH collateral handling
- Borrow transaction logic
- Repayment transaction logic
- Withdrawal transaction logic
- Contract read functions

### Wallet functionality

Do NOT replace or remove:

- WalletContext
- MetaMask integration
- Existing wallet connection implementation
- Wallet address handling
- Wallet error handling
- Network handling

### Routing

Do NOT remove or rename existing routes.

Current public routes:

- `/`
- `/terms`

Current application routes:

- `/dashboard`
- `/lend`
- `/borrow`
- `/repay`
- `/risk-analysis`
- `/transactions`
- `/markets`
- `/portfolio`

The Welcome page and Terms page must remain separate.

### Backend/API functionality

Do NOT modify existing backend/API integration unless explicitly requested.

Do not invent API endpoints.

Do not replace real backend data with fake data.

### Smart contract data

Do not invent contract functions, contract values, transaction results, balances, health factors, interest rates, or risk scores.

If real data is unavailable, display:

- `--`
- `Not available`
- `Connect wallet`
- or another honest empty state.

Never present fabricated values as real blockchain data.

---

# 4. EXISTING TECHNOLOGY

The frontend currently uses:

- React
- Vite
- React Router
- JavaScript / JSX
- CSS
- ethers.js
- MetaMask
- Ethereum Sepolia testnet

Existing project architecture includes:

```text
src/
├── App.jsx
├── main.jsx
├── App.css
├── index.css
├── Pages/
│   ├── Welcome.jsx
│   ├── Welcome.css
│   ├── Terms.jsx
│   ├── Terms.css
│   ├── Dashboard.jsx
│   ├── Lend.jsx
│   ├── Borrow.jsx
│   ├── Repay.jsx
│   ├── RiskAnalysis.jsx
│   ├── Transactions.jsx
│   ├── Markets.jsx
│   └── Portfolio.jsx
├── blockchain/
│   ├── contracts.js
│   └── web3.js
└── context/
    └── WalletContext.jsx
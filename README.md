# Algorand-Native Decentralized OTC Trading Platform

[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Framework](https://img.shields.io/badge/Framework-AlgoKit-blue.svg)
![Language](https://img.shields.io/badge/Language-Python-green.svg)
![Frontend](https://img.shields.io/badge/Frontend-React-cyan.svg)

A trustless, on-chain Over-the-Counter (OTC) trading platform for **Algorand Standard Assets (ASAs)**, secured entirely by an Algorand smart contract.

---

## 🌐 Live Demo

Try it now: [https://algorand-otc.vercel.app/](https://algorand-otc.vercel.app/)

---

## 📖 Overview
This project provides a **fully decentralized solution** for two parties to securely swap specific amounts of ASAs **without counterparty risk**.  

Unlike Decentralized Exchanges (DEXs), which are optimized for liquid, order-book-based trading, this platform is designed for **larger, less liquid, or highly specific trades** that are typically arranged off-chain.

---

## ❌ The Problem
Currently, conducting large or specific ASA trades requires **off-chain communication** and a **high degree of trust** between parties, or complex, manual multi-signature escrow setups.  

This process is:
- Inefficient ⚡
- Prone to scams ⚠️
- Introduces significant counterparty risk ❌  

There is **no native, on-chain mechanism** to facilitate these trustless OTC deals.

---

## ✅ The Solution
An **Algorand Smart Contract** that acts as a trustless **escrow and atomic swap agent**.

- A **Maker** creates an on-chain offer by depositing their assets into the smart contract.  
- A **Taker** accepts the offer by depositing their corresponding assets.  
- The smart contract automatically and atomically **executes the swap**, ensuring **both sides happen or neither does**.  

---

## ✨ Key Features
- **Offer Creation**: Public or private offers with ASA details, quantities, and expiration.  
- **Trustless Escrow**: Maker’s assets are locked in the smart contract.  
- **Atomic Swap Execution**: Instant asset swaps without counterparty risk.  
- **Dispute Resolution & Refunds**: Expired offers can be reclaimed by the Maker.  
- **Private Trades**: Offers restricted to a specific Algorand address.  

---

## 🔄 Visual Workflow
![Workflow Diagram](assets/workflow_diagram.png)  
*(Place your diagram in an `assets/` folder in the project root)*

---

## 🛠️ Tech Stack

### 🔗 Smart Contract (Backend)
- **Language**: Python  
- **Framework**: Beaker  
- **TealScript**: PyTeal  

### 💻 dApp (Frontend)
- **Framework**: React (Vite)  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **Wallet Integration**: `use-wallet` (Pera Wallet & others)  

### ⚙️ Development & Tooling
- **Orchestration**: AlgoKit  
- **Environment**: Docker  
- **Python Dependencies**: Poetry  
- **Node Dependencies**: NPM  

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have installed:
- [AlgoKit](https://github.com/algorandfoundation/algokit) (v2.0.0 or higher)  
- Docker  
- Python (3.12 or higher)  
- Node.js (v18 or higher)  
- Poetry  

---

### 🔧 Installation & Setup

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Srizdebnath/algorand-otc.git
   cd algorand-otc
   ```

2. **Set up the smart contract environment**
   ```bash
   cd projects/algorand-otc-contracts
   poetry install
   ```

3. **Set up the frontend dApp**
   ```bash
   cd ../algorand-otc-frontend
   npm install
   cd ../..
   ```

---

### ▶️ Running the Project

1. **Start LocalNet**
   ```bash
   algokit localnet start
   ```

2. **Build & Deploy the Smart Contract**
   ```bash
   algokit run build
   algokit run deploy:localnet
   ```

3. **Run the Frontend dApp**
   ```bash
   cd projects/algorand-otc-frontend
   npm run dev
   ```

Open your browser at 👉 [http://localhost:5173](http://localhost:5173)

---

### 📂 Project Structure

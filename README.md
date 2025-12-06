<div align="center">

# 🚀 NAD.FUN Trading Bot

### Sniper • Bundler • Volume Bot for Monad

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-purple.svg)](https://docs.ethers.org/)
[![Telegram](https://img.shields.io/badge/Telegram-@vladmeer67-blue?logo=telegram)](https://t.me/vladmeer67)

![Nad.fun](https://github.com/user-attachments/assets/9ad524dc-fc06-4382-8105-994c5f85c81b)

**High-performance trading toolkit for the Nad.fun ecosystem on Monad**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Configuration](#%EF%B8%8F-configuration) • [Contact](#-contact)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎯 **Sniper Bot** | Auto-detect and buy new tokens instantly at launch |
| 💼 **Bundler** | Multi-wallet management with batch buy/sell operations |
| 📊 **Volume Bot** | Configurable buy/sell loops for liquidity simulation |
| 🛠️ **Manual Trading** | Precision trades with custom amounts and slippage |
| 🔔 **Notifications** | Optional Telegram alerts for trade updates |

---

## 📦 Installation

### Prerequisites
- Node.js v16+
- npm or yarn
- Monad RPC endpoint
- Funded wallet (keep your private key secure!)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/vladmeer/nadfun-bundler.git
cd nadfun-bundler

# Install dependencies
npm install

# Configure environment
cp example.env .env
# Edit .env with your settings

# Start the bot
npm start
```

---

## 🎮 Usage

Launch the bot and select from the interactive menu:

```
╔═══════════════════════════════════════════════╗
║          NAD.FUN TRADING BOT                  ║
╠═══════════════════════════════════════════════╣
║  1. Manual Buy                                ║
║  2. Manual Sell                               ║
║  3. Sell All (API)                            ║
║  4. Auto Buy New Tokens (Sniper)              ║
║  5. Bundler Mode (Interactive)                ║
║  6. Exit                                      ║
╚═══════════════════════════════════════════════╝
```

### 🎯 Sniper Mode
Monitor the chain and auto-buy new tokens the moment they launch. Be first in line!

### 💼 Bundler Mode
- **Generate Wallets** — Create multiple wallets for bundling
- **Batch Buy/Sell** — Execute trades across all wallets simultaneously
- **Export Wallets** — Save wallet data to `generated_wallets.txt`

### 🛠️ Manual Trading
Execute precise buy/sell orders with custom token addresses, amounts, and slippage.

---

## ⚙️ Configuration

Edit your `.env` file with the following settings:

```env
# Required
PRIVATE_KEY=your_private_key_here
RPC_URL=your_monad_rpc_url

# Trading Settings
BUY_AMOUNT=0.1
SLIPPAGE=10

# Optional: Telegram Notifications
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## ⚠️ Disclaimer

> **USE AT YOUR OWN RISK**

Trading cryptocurrencies involves significant risk. This software is provided "as is" without warranty. The authors are not responsible for any financial losses.

- ✅ Always test with small amounts first
- ✅ Keep your private keys secure
- ✅ Never share your `.env` file
- ❌ Do not use for market manipulation

---

## Demo
Bundler: <br />
https://github.com/user-attachments/assets/fd4923c4-c9da-471a-9efb-a86247f521e6

Volume bot: <br />
https://www.youtube.com/watch?v=i6n5mnxjb4o

## 👤 Contact

<div align="center">

**Vladmeer** — Developer & Maintainer

[![Telegram](https://img.shields.io/badge/Telegram-@vladmeer67-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/vladmeer67)
[![Twitter](https://img.shields.io/badge/Twitter-@vladmeer67-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/vladmeer67)
[![GitHub](https://img.shields.io/badge/GitHub-vladmeer-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/vladmeer)

---

⭐ **Star this repo if you find it useful!** ⭐

</div>

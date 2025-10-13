![fourmeme-bot](https://github.com/user-attachments/assets/ea07080a-db33-4a2d-ba93-5c8739959682)

## FourMeme Bot — BNB Bundler & Volume Toolkit

A modular CLI toolkit for development and testing with the Four.meme ecosystem on BNB Chain. Includes bundled modules for route batching, rate‑limited volume simulation, and copy‑trading. Intended for development, testing, and research — use responsibly and never for market manipulation.

### Key features

Bundler — execute predefined swap routes (e.g. WBNB → TOKEN), extendable for multicall flows.
Volume Bot — configurable rate‑limited buy/sell loops for liquidity testing.
Copy Trader — mirror trades from target wallets (for research/testing).
Notifications & Controls — optional Telegram alerts, allow/deny lists, spend caps, and basic MEV-aware settings.

### Prerequisites

Node.js 22+
BNB Chain RPC endpoint
Funded BNB wallet (private key, keep it secret)

### Install
``git clone <repo>
cd <repo>
npm install
cp .env.example .env      # populate values``

### Build
``npm run build``

### Usage
```
# Copy-trader
node dist/index.js copy -c ./config/copy.json

# Sniper (use --dry-run for simulation)
node dist/index.js sniper -c ./config/sniper.json --dry-run

# Bundler
node dist/index.js bundle -c ./config/bundle.json

# Volume bot
node dist/index.js volume -c ./config/volume.json
```

Use --help on any command for options.

### Configuration

Edit JSON files in ./config (examples included):
sniper.json, copy.json, bundle.json, volume.json — set routes, slippage, amounts, limits and intervals.

For Telegram alerts (optional) set in .env:

```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

### Safety & Best Practices

- Always start in --dry-run/simulation mode.
- Use a dedicated, minimal‑fund hot wallet for experiments.
- Never commit private keys or secrets.
- Validate token/router addresses and caps before enabling live runs.
- Do not use this toolkit to manipulate markets or perform harmful activity.

### 👤 Author
#### Telegram: [Vladmeer](https://t.me/vladmeer67)   
https://t.me/vladmeer67

#### Twitter: [Vladmeer](https://x.com/vladmeer67)   
https://x.com/vladmeer67

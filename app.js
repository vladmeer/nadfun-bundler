require('dotenv').config();
const { runStrategy } = require('./index.js');
const { generateWallets } = require('./lib/walletManager.js');
const { loadAbi } = require('./lib/trader.js');
const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs');

const config = {
    rpcUrls: process.env.RPC_URLS,
    chainId: process.env.CHAIN_ID,
    privateKeys: process.env.PRIVATE_KEYS,
    tokenAddress: process.env.TOKEN_ADDRESS,
    amountMon: process.env.AMOUNT_MON,
    sellPercent: process.env.SELL_PERCENT,
};

function printHeader() {
    console.clear();
    console.log("=================================================");
    console.log("          NAD.FUN TRADING BOT V2                 ");
    console.log("=================================================");
    console.log("");
}

async function handleBundlerMode() {
    while (true) {
        console.log("\n--- Bundler Mode ---");
        console.log("1. Generate Wallets");
        console.log("2. Bundler Buy (Interactive)");
        console.log("3. Bundler Sell (Interactive)");
        console.log("4. Back to Main Menu");
        console.log("");

        const choice = prompt("Enter choice (1-4): ");

        if (choice === '1') {
            const count = parseInt(prompt("How many wallets to generate? "), 10);
            if (isNaN(count) || count <= 0) {
                console.log("❌ Invalid number.");
                continue;
            }
            const wallets = generateWallets(count);
            console.log(`\n✅ Generated ${count} wallets:`);
            let content = "";
            wallets.forEach((w, i) => {
                console.log(`${i + 1}. ${w.address}`);
                content += `${w.privateKey}\n`;
            });

            const save = prompt("Save private keys to 'generated_wallets.txt'? (y/n): ").toLowerCase();
            if (save === 'y') {
                fs.writeFileSync('generated_wallets.txt', content);
                console.log("✅ Saved to generated_wallets.txt");
                console.log("⚠️  Don't forget to fund these wallets and add them to .env if you want to use them!");
            }

        } else if (choice === '2') {
            const token = prompt("Enter Token Address: ").trim();
            const amount = prompt("Enter Amount (MON) per wallet: ").trim();

            if (!token || !amount) {
                console.log("❌ Invalid input.");
                continue;
            }

            console.log(`\n🚀 Launching Bundler Buy...`);
            console.log(`Token: ${token}`);
            console.log(`Amount: ${amount} MON`);

            await runStrategy({
                ...config,
                tokenAddress: token,
                amountMon: amount,
                strategy: 'manual_buy'
            });

        } else if (choice === '3') {
            const token = prompt("Enter Token Address: ").trim();
            const percent = prompt("Enter Sell Percent (1-100): ").trim();

            if (!token || !percent) {
                console.log("❌ Invalid input.");
                continue;
            }

            console.log(`\n🚀 Launching Bundler Sell...`);
            console.log(`Token: ${token}`);
            console.log(`Percent: ${percent}%`);

            await runStrategy({
                ...config,
                tokenAddress: token,
                sellPercent: percent,
                strategy: 'manual_sell'
            });

        } else if (choice === '4') {
            break;
        } else {
            console.log("❌ Invalid choice.");
        }
    }
}

async function main() {
    await loadAbi();
    while (true) {
        printHeader();
        console.log("Select an operation:");
        console.log("1. Manual Buy");
        console.log("2. Manual Sell");
        console.log("3. Sell All (API)");
        console.log("4. Auto Buy New Tokens (Sniper)");
        console.log("5. Bundler Mode (Interactive)");
        console.log("6. Exit");
        console.log("");

        const choice = prompt("Enter choice (1-6): ");

        try {
            switch (choice) {
                case '1':
                    console.log("\n=== Starting Manual Buy Operation ===");
                    const buyToken = prompt("Enter Token Address: ").trim();
                    if (!buyToken) {
                        console.log("❌ Token address is required.");
                        break;
                    }
                    await runStrategy({
                        ...config,
                        tokenAddress: buyToken,
                        strategy: 'manual_buy',
                    });
                    break;
                case '2':
                    console.log("\n=== Starting Manual Sell Operation ===");
                    const sellToken = prompt("Enter Token Address: ").trim();
                    if (!sellToken) {
                        console.log("❌ Token address is required.");
                        break;
                    }
                    await runStrategy({
                        ...config,
                        tokenAddress: sellToken,
                        strategy: 'manual_sell',
                    });
                    break;
                case '3':
                    console.log("\n=== Starting Sell All Strategy ===");
                    await runStrategy({
                        ...config,
                        tokenAddress: null,
                        strategy: 'sell_all',
                    });
                    break;
                case '4':
                    console.log("\n=== Starting Auto Buy New Tokens (Sniper) ===");
                    await runStrategy({
                        ...config,
                        tokenAddress: null,
                        strategy: 'auto_buy_new',
                    });
                    break;
                case '5':
                    await handleBundlerMode();
                    break;
                case '6':
                    console.log("\nExiting...");
                    process.exit(0);
                    break;
                default:
                    console.log("\n❌ Invalid choice. Please try again.");
            }
        } catch (error) {
            console.error("\n❌ Error occurred:", error.message);
        }

        if (choice !== '6' && choice !== '5') {
            console.log("\nOperation completed or stopped.");
            prompt("Press Enter to return to menu...");
        }
    }
}

main();

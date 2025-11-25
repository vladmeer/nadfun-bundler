const { doSellAutoPercent, doBuyAuto } = require('./trader.js');
const { withActiveProvider } = require('./walletManager.js');
const { ethers } = require('ethers');

async function sellAllFromApi(wallets, page = 1, limit = 10, withActiveProviderWithConfig) {
    for (const w of wallets) {
        const addr = w.address;
        const url = `https://api.nad.fun/profile/position/${addr}?page=${page}&limit=${limit}&position_type=OPEN`;
        console.log(`🔎 Fetching positions for: ${addr}`);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            const data = await res.json();
            const positions = Array.isArray(data.positions) ? data.positions : [];
            if (!positions.length) {
                console.log(`ℹ️ ${addr} has no open positions.`);
                continue;
            }

            for (const p of positions) {
                const tokenAddr = p?.token?.token_id;
                if (!tokenAddr) continue;

                if (!w.privateKey) {
                    console.error(`❌ Missing private key for ${addr}. Skipping.`);
                    continue;
                }

                await withActiveProviderWithConfig(async (provider) => {
                    const wallet = new ethers.Wallet(w.privateKey, provider);
                    console.log(`[SELL ALL] 🔴 Selling 100% of token ${tokenAddr} for ${addr.slice(0, 6)}...`);
                    await doSellAutoPercent({ privateKey: w.privateKey, address: wallet.address }, tokenAddr, 100, withActiveProviderWithConfig);
                });
            }
        } catch (e) {
            console.error(`❌ Failed to fetch/sell positions for ${addr}:`, e.message || e);
        }
    }
}

async function monitorNewTokens(wallets, amountMon, withActiveProviderWithConfig) {
    let seenTokens = new Set();
    let isFirstRun = true;

    console.log("🚀 Starting New Token Monitor...");
    console.log("Waiting for new 'CREATE' events...");

    while (true) {
        try {
            const res = await fetch('https://nad.fun/api/token/new-event');
            if (!res.ok) {
                console.warn(`⚠️ API Error: ${res.status} ${res.statusText}`);
                await new Promise(r => setTimeout(r, 2000));
                continue;
            }

            const events = await res.json();
            const createEvents = events.filter(e => e.type === 'CREATE');

            if (isFirstRun) {
                createEvents.forEach(e => {
                    if (e.token_info && e.token_info.token_id) {
                        seenTokens.add(e.token_info.token_id);
                    }
                });
                console.log(`ℹ️ Initialized. Ignoring ${seenTokens.size} existing tokens.`);
                isFirstRun = false;
            } else {
                // Process events. The API returns a list, usually sorted.
                // We iterate through all found CREATE events.
                for (const event of createEvents) {
                    const tokenInfo = event.token_info;
                    if (!tokenInfo || !tokenInfo.token_id) continue;

                    const tokenId = tokenInfo.token_id;

                    if (!seenTokens.has(tokenId)) {
                        seenTokens.add(tokenId);
                        console.log(`\n🔔 NEW TOKEN DETECTED: ${tokenInfo.name} (${tokenInfo.symbol})`);
                        console.log(`📍 Address: ${tokenId}`);
                        console.log(`👤 Creator: ${tokenInfo.creator?.nickname || 'Unknown'}`);

                        console.log(`🚀 Triggering Auto-Buy for ${wallets.length} wallets...`);

                        // Execute buy for all wallets
                        try {
                            await Promise.all(wallets.map(w =>
                                doBuyAuto(w, tokenId, amountMon, withActiveProviderWithConfig)
                            ));
                        } catch (err) {
                            console.error(`❌ Buy execution failed: ${err.message}`);
                        }
                    }
                }
            }

        } catch (e) {
            console.error(`❌ Monitor Loop Error: ${e.message}`);
        }

        // Poll every 2 seconds
        await new Promise(r => setTimeout(r, 2000));
    }
}

module.exports = {
    sellAllFromApi,
    monitorNewTokens,
};

import { doSellAutoPercent, doBuyAuto } from './trader';
import { WalletInfo, WithActiveProviderFn } from './walletManager';
import { ethers, Provider } from 'ethers';

interface TokenInfo {
    token_id?: string;
    name?: string;
    symbol?: string;
    creator?: { nickname?: string };
}

interface Position {
    token?: { token_id?: string };
}

interface PositionsResponse {
    positions?: Position[];
}

interface NewTokenEvent {
    type: string;
    token_info?: TokenInfo;
}

export async function sellAllFromApi(
    wallets: WalletInfo[],
    page: number = 1,
    limit: number = 10,
    withActiveProviderWithConfig: WithActiveProviderFn
): Promise<void> {
    for (const w of wallets) {
        const addr = w.address;
        const url = `https://api.nad.fun/profile/position/${addr}?page=${page}&limit=${limit}&position_type=OPEN`;
        console.log(`🔎 Fetching positions for: ${addr}`);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            const data = await res.json() as PositionsResponse;
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

                await withActiveProviderWithConfig(async (provider: Provider) => {
                    const wallet = new ethers.Wallet(w.privateKey, provider);
                    console.log(`[SELL ALL] 🔴 Selling 100% of token ${tokenAddr} for ${addr.slice(0, 6)}...`);
                    await doSellAutoPercent({ privateKey: w.privateKey, address: wallet.address }, tokenAddr, 100, withActiveProviderWithConfig);
                });
            }
        } catch (e) {
            console.error(`❌ Failed to fetch/sell positions for ${addr}:`, (e as Error).message || e);
        }
    }
}

export async function monitorNewTokens(
    wallets: WalletInfo[],
    amountMon: string,
    withActiveProviderWithConfig: WithActiveProviderFn
): Promise<void> {
    let seenTokens = new Set<string>();
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

            const events = await res.json() as NewTokenEvent[];
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

                        try {
                            await Promise.all(wallets.map(w =>
                                doBuyAuto(w, tokenId, amountMon, withActiveProviderWithConfig)
                            ));
                        } catch (err) {
                            console.error(`❌ Buy execution failed: ${(err as Error).message}`);
                        }
                    }
                }
            }

        } catch (e) {
            console.error(`❌ Monitor Loop Error: ${(e as Error).message}`);
        }

        await new Promise(r => setTimeout(r, 2000));
    }
}


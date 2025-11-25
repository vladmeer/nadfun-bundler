const { ethers } = require('ethers');
const fs = require('fs');

async function withActiveProvider(fn, rpcUrls, chainId) {
    const urls = rpcUrls.split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) {
        throw new Error("❌ RPC_URLS cannot be empty.");
    }

    let lastErr;
    for (const url of urls) {
        try {
            const provider = chainId
                ? new ethers.JsonRpcProvider(url, { name: 'custom', chainId: parseInt(chainId, 10) })
                : new ethers.JsonRpcProvider(url);

            const p = provider.getBlockNumber();
            const t = new Promise((_, rej) => setTimeout(() => rej(new Error('RPC_TIMEOUT')), 3000));
            await Promise.race([p, t]);

            return await fn(provider);
        } catch (e) {
            console.warn(`⚠️ RPC Failed: ${url} (${e.message || e})`);
            lastErr = e;
            continue;
        }
    }
    throw lastErr || new Error('All RPCs failed.');
}

function parseWallets(pkString) {
    const lines = pkString.split(/\r?\n|,/g).map(s => s.trim()).filter(Boolean);
    const pks = [];
    for (const line of lines) {
        if (/^0x[0-9a-fA-F]{64}$/.test(line)) {
            pks.push(line);
        } else {
            console.warn(`⚠️ Skipping invalid PK: ${line.slice(0, 12)}...`);
        }
    }
    if (!pks.length) {
        throw new Error("❌ No valid private keys provided.");
    }
    const wallets = pks.map(pk => ({ privateKey: pk, address: new ethers.Wallet(pk).address }));
    return wallets;
}

function generateWallets(count) {
    const wallets = [];
    for (let i = 0; i < count; i++) {
        const w = ethers.Wallet.createRandom();
        wallets.push({
            address: w.address,
            privateKey: w.privateKey
        });
    }
    return wallets;
}

module.exports = {
    withActiveProvider,
    parseWallets,
    generateWallets,
};
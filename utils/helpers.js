const { ethers } = require('ethers');

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function randBetween(min, max, decimals = 4) {
    const v = Math.random() * (max - min) + min;
    return v.toFixed(decimals);
}

function applySlippage(amount, slippagePct) {
    const factor = 1000n - BigInt(Math.floor(slippagePct * 10));
    return (BigInt(amount) * factor) / 1000n;
}

async function getBumpedFees(provider, attempt = 0) {
    const bump = 1 + Math.min(attempt * 0.1, 0.60);
    const fd = await provider.getFeeData();
    const baseMaxFee = fd.maxFeePerGas ?? ethers.parseUnits('2', 'gwei');
    const basePrio = fd.maxPriorityFeePerGas ?? ethers.parseUnits('1', 'gwei');
    const mul = BigInt(Math.floor(bump * 100));
    return {
        maxFeePerGas: (baseMaxFee * mul) / 100n,
        maxPriorityFeePerGas: (basePrio * mul) / 100n,
    };
}

async function sendTxWithRetry(callBuilder, provider, label, retries = 2) {
    let lastErr;
    for (let i = 0; i <= retries; i++) {
        try {
            const fees = await getBumpedFees(provider, i);
            const tx = await callBuilder(fees);
            console.log(`${label} ✅ Transaction Sent: ${tx.hash}`);
            const rc = await tx.wait();
            console.log(`${label} ✅ Transaction Confirmed (Block: ${rc.blockNumber})`);
            return rc;
        } catch (e) {
            lastErr = e;
            const msg = (e?.error?.message || e?.info?.error?.message || e?.message || '').toLowerCase();
            console.warn(`${label} ⚠️ Attempt ${i + 1} Failed: ${e.message || e}`);
            const retriable =
                msg.includes('replacement') ||
                msg.includes('underpriced') ||
                msg.includes('base fee') ||
                msg.includes('nonce') ||
                msg.includes('fee') ||
                msg.includes('timeout') ||
                msg.includes('too low');
            if (!retriable || i === retries) break;
            await sleep(800 * (i + 1));
        }
    }
    throw lastErr;
}

module.exports = {
    sleep,
    randBetween,
    applySlippage,
    getBumpedFees,
    sendTxWithRetry,
};
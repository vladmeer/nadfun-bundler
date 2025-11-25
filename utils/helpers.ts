import { ethers, Provider, TransactionReceipt } from 'ethers';

export function sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
}

export function randBetween(min: number, max: number, decimals: number = 4): string {
    const v = Math.random() * (max - min) + min;
    return v.toFixed(decimals);
}

export function applySlippage(amount: bigint | string, slippagePct: number): bigint {
    const factor = 1000n - BigInt(Math.floor(slippagePct * 10));
    return (BigInt(amount) * factor) / 1000n;
}

export async function getBumpedFees(provider: Provider, attempt: number = 0): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}> {
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

export interface FeeData {
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}

export async function sendTxWithRetry(
    callBuilder: (fees: FeeData) => Promise<ethers.TransactionResponse>,
    provider: Provider,
    label: string,
    retries: number = 2
): Promise<TransactionReceipt> {
    let lastErr: Error | undefined;
    for (let i = 0; i <= retries; i++) {
        try {
            const fees = await getBumpedFees(provider, i);
            const tx = await callBuilder(fees);
            console.log(`${label} ✅ Transaction Sent: ${tx.hash}`);
            const rc = await tx.wait();
            if (!rc) throw new Error('Transaction failed - no receipt');
            console.log(`${label} ✅ Transaction Confirmed (Block: ${rc.blockNumber})`);
            return rc;
        } catch (e) {
            lastErr = e as Error;
            const err = e as { error?: { message?: string }; info?: { error?: { message?: string } }; message?: string };
            const msg = (err?.error?.message || err?.info?.error?.message || err?.message || '').toLowerCase();
            console.warn(`${label} ⚠️ Attempt ${i + 1} Failed: ${(e as Error).message || e}`);
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


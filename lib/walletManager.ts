import { ethers, JsonRpcProvider, Provider } from 'ethers';

export interface WalletInfo {
    privateKey: string;
    address: string;
}

export type WithActiveProviderFn = <T>(fn: (provider: Provider) => Promise<T>) => Promise<T>;

export async function withActiveProvider<T>(
    fn: (provider: Provider) => Promise<T>,
    rpcUrls: string,
    chainId?: string
): Promise<T> {
    const urls = rpcUrls.split(',').map(s => s.trim()).filter(Boolean);
    if (!urls.length) {
        throw new Error("❌ RPC_URLS cannot be empty.");
    }

    let lastErr: Error | undefined;
    for (const url of urls) {
        try {
            const provider = chainId
                ? new JsonRpcProvider(url, { name: 'custom', chainId: parseInt(chainId, 10) })
                : new JsonRpcProvider(url);

            const p = provider.getBlockNumber();
            const t = new Promise<never>((_, rej) => setTimeout(() => rej(new Error('RPC_TIMEOUT')), 3000));
            await Promise.race([p, t]);

            return await fn(provider);
        } catch (e) {
            console.warn(`⚠️ RPC Failed: ${url} (${(e as Error).message || e})`);
            lastErr = e as Error;
            continue;
        }
    }
    throw lastErr || new Error('All RPCs failed.');
}

export function parseWallets(pkString: string): WalletInfo[] {
    const lines = pkString.split(/\r?\n|,/g).map(s => s.trim()).filter(Boolean);
    const pks: string[] = [];
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
    const wallets: WalletInfo[] = pks.map(pk => ({ privateKey: pk, address: new ethers.Wallet(pk).address }));
    return wallets;
}

export function generateWallets(count: number): WalletInfo[] {
    const wallets: WalletInfo[] = [];
    for (let i = 0; i < count; i++) {
        const w = ethers.Wallet.createRandom();
        wallets.push({
            address: w.address,
            privateKey: w.privateKey
        });
    }
    return wallets;
}


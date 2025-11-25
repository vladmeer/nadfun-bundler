const { doBuyAuto, doSellAutoPercent } = require('./lib/trader.js');
const { sellAllFromApi, monitorNewTokens } = require('./lib/strategy.js');
const { parseWallets, withActiveProvider } = require('./lib/walletManager.js');

async function runStrategy(config) {
    if (!config.rpcUrls || !config.privateKeys || !config.strategy) {
        throw new Error("Incomplete configuration. Ensure rpcUrls, privateKeys, and strategy are filled.");
    }

    const wallets = parseWallets(config.privateKeys);

    const withActiveProviderWithConfig = (fn) => withActiveProvider(fn, config.rpcUrls, config.chainId);
    const tokenAddresses = config.tokenAddress ? config.tokenAddress.split(',').map(s => s.trim()) : [];

    switch (config.strategy.toLowerCase()) {
        case 'manual_buy':
            if (tokenAddresses.length === 0 || !config.amountMon) {
                throw new Error("For 'manual_buy' strategy, tokenAddress and amountMon are required.");
            }
            await Promise.all(wallets.map(wallet =>
                doBuyAuto(wallet, tokenAddresses[0], config.amountMon, withActiveProviderWithConfig)
            ));
            break;

        case 'auto_buy_new':
            if (!config.amountMon) {
                throw new Error("For 'auto_buy_new' strategy, amountMon is required.");
            }
            await monitorNewTokens(wallets, config.amountMon, withActiveProviderWithConfig);
            break;

        case 'manual_sell':
            if (tokenAddresses.length === 0 || !config.sellPercent) {
                throw new Error("For 'manual_sell' strategy, tokenAddress and sellPercent are required.");
            }
            await Promise.all(wallets.map(wallet =>
                doSellAutoPercent(wallet, tokenAddresses[0], config.sellPercent, withActiveProviderWithConfig)
            ));
            break;

        case 'sell_all':
            await sellAllFromApi(wallets, 1, 10, withActiveProviderWithConfig);
            break;

        default:
            throw new Error(`Unknown strategy '${config.strategy}'. Choose from: 'manual_buy', 'manual_sell', or 'sell_all'.`);
    }
}

module.exports = { runStrategy };

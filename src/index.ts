#!/usr/bin/env node
import { Command } from 'commander'
import { loadEnvironment } from './lib/config.js'
import { createLogger } from './lib/logger.js'
import { createWalletAndProvider } from './lib/provider.js'
import { Sniper } from './modules/sniper/Sniper.js'
import { CopyTrader } from './modules/copytrader/CopyTrader.js'
import { Bundler } from './modules/bundler/Bundler.js'
import { VolumeBot } from './modules/volume/VolumeBot.js'

const program = new Command()

program
  .name('fourmeme-cli')
  .description('Four.Meme trading toolkit — modular CLI for strategy execution and testing')
  .version('0.1.0')
  .addHelpText(
    'after',
    `
Examples:
  $ fourmeme-cli sniper --config ./config/sniper.json
  $ fourmeme-cli copy --dry-run
  $ fourmeme-cli bundle --config ./config/bundle.json
`
  )

/**
 * Helper to register a module command that follows the same lifecycle:
 *  - load environment
 *  - create logger
 *  - create wallet & provider
 *  - instantiate and run module
 *
 * @param {string} name command name
 * @param {string} description professional description
 * @param {Function} ModuleClass class/constructor for the module
 * @param {string} defaultConfig default config path
 */
function registerCommand(name, description, ModuleClass, defaultConfig) {
  program
    .command(name)
    .description(description)
    .option('-c, --config <path>', 'Path to JSON config file', defaultConfig)
    .option('--dry-run', 'Run in simulation mode (no transactions will be sent)', false)
    .action(async (opts) => {
      // Fail-fast on unexpected errors
      try {
        const env = loadEnvironment()
        const logger = createLogger(env.LOG_LEVEL)
        logger.info(`Starting "${name}" command`)
        logger.debug('Environment loaded', { env })

        const { wallet, provider } = createWalletAndProvider(env)
        logger.debug('Wallet and provider created', {
          walletAddress: wallet?.address?.toString?.() ?? 'N/A',
          provider: provider?.connection?.url ?? 'provider',
        })

        const moduleInstance = new ModuleClass({
          wallet,
          provider,
          logger,
          dryRun: Boolean(opts.dryRun),
          env,
        })

        if (typeof moduleInstance.run !== 'function') {
          throw new Error(`Module ${ModuleClass.name} does not implement run(configPath)`)
        }

        await moduleInstance.run(opts.config)
        logger.info(`"${name}" completed successfully`)
      } catch (err) {
        // Structured logging and graceful exit
        // eslint-disable-next-line no-console
        console.error(`Error running "${name}":`, err?.message ?? err)
        // if you want more details, use logger.error when available
        process.exitCode = 1
      }
    })
}

// Register commands
registerCommand(
  'sniper',
  'Monitor new launches and attempt purchases according to configured sniper strategy.',
  Sniper,
  './config/sniper.json'
)

registerCommand(
  'copy',
  'Copy trades from a set of target wallets according to configured rules.',
  CopyTrader,
  './config/copy.json'
)

registerCommand(
  'bundle',
  'Batch multiple calls or transactions into a single bundling strategy for testing or efficiency.',
  Bundler,
  './config/bundle.json'
)

registerCommand(
  'volume',
  'Run a rate-limited volume bot to simulate or provide liquidity-based trades.',
  VolumeBot,
  './config/volume.json'
)

// parse arguments
await program.parseAsync(process.argv)

import { loadConfig, validateConfig } from "./config";
import { createLogger } from "./logger";
import { startMonitor } from "./monitor";

/**
 * Main entry point
 */
const main = async (): Promise<void> => {
  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);

    // Create logger (pass format so logs can be JSON/human readable)
    // cast to any to remain compatible with older signatures
    const logger = (createLogger as any)(config.logLevel, config.logFormat);

    // Log startup config (redacting secrets)
    logger.info("Starting monitor", {
      channelId: config.channelId,
      checkInterval: config.checkInterval,
      requestTimeout: config.requestTimeout,
      logFormat: config.logFormat,
    });

    // Start monitor
    await startMonitor(config, logger);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${errorMessage}`);
    process.exit(1);
  }
};

// Run the application
main();

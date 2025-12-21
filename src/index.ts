import { loadConfig, validateConfig } from "./config.js";
import { createLogger } from "./logger.js";
import { startMonitor } from "./monitor.js";

/**
 * Main entry point
 */
const main = async (): Promise<void> => {
  try {
    // Load and validate configuration
    const config = loadConfig();
    validateConfig(config);

    // Create logger
    const logger = createLogger(config.logLevel);

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

import { Logger, LogLevel } from "./types.js";

/**
 * Format timestamp for logging
 */
const getTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Log level priority
 */
const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Format log message
 */
const formatMessage = (level: LogLevel, message: string): string =>
  `[${getTimestamp()}] ${level.toUpperCase()}: ${message}`;

/**
 * Create a logger instance with specified log level
 */
export const createLogger = (minLevel: LogLevel): Logger => {
  const minPriority = logLevelPriority[minLevel];

  const shouldLog = (level: LogLevel): boolean =>
    logLevelPriority[level] >= minPriority;

  const log = (level: LogLevel, message: string): void => {
    if (shouldLog(level)) {
      const formatted = formatMessage(level, message);
      if (level === "error") {
        console.error(formatted);
      } else {
        console.log(formatted);
      }
    }
  };

  return {
    debug: (message: string) => log("debug", message),
    info: (message: string) => log("info", message),
    warn: (message: string) => log("warn", message),
    error: (message: string) => log("error", message),
  };
};

/**
 * Create a scoped logger that prefixes messages
 */
export const createScopedLogger = (logger: Logger, scope: string): Logger => ({
  debug: (message: string) => logger.debug(`[${scope}] ${message}`),
  info: (message: string) => logger.info(`[${scope}] ${message}`),
  warn: (message: string) => logger.warn(`[${scope}] ${message}`),
  error: (message: string) => logger.error(`[${scope}] ${message}`),
});

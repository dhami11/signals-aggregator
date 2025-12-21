import { config } from "dotenv";
import { Config, LogLevel } from "./types.js";

// Load environment variables
config();

/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = (): Config => {
  const discordToken = process.env.DISCORD_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const ntfyTopic = process.env.NTFY_TOPIC;

  if (!discordToken || !channelId || !ntfyTopic) {
    throw new Error(
      "Missing required environment variables: DISCORD_TOKEN, DISCORD_CHANNEL_ID, NTFY_TOPIC"
    );
  }

  const logLevel: LogLevel = (process.env.LOG_LEVEL || "info") as LogLevel;
  const enableDesktopNotifications =
    process.env.ENABLE_DESKTOP_NOTIFICATIONS !== "false";
  const enableMobileNotifications =
    process.env.ENABLE_MOBILE_NOTIFICATIONS !== "false";

  return {
    discordToken,
    channelId,
    ntfyTopic,
    checkInterval: parseInt(process.env.CHECK_INTERVAL || "5", 10),
    logLevel,
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "10", 10),
    enableDesktopNotifications,
    enableMobileNotifications,
  };
};

/**
 * Validate that config is present and valid
 */
export const validateConfig = (config: Config): void => {
  if (!config.discordToken || config.discordToken.length === 0) {
    throw new Error("Invalid Discord token");
  }

  if (!config.channelId || config.channelId.length === 0) {
    throw new Error("Invalid channel ID");
  }

  if (!config.ntfyTopic || config.ntfyTopic.length === 0) {
    throw new Error("Invalid ntfy topic");
  }

  if (config.checkInterval < 1) {
    throw new Error("Check interval must be at least 1 second");
  }
};

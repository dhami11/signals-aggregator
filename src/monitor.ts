import { Config, Message, Logger, MonitorState } from "./types.js";
import { getLatestMessageId, createDiscordPoller } from "./discord.js";
import { sendNotifications } from "./notifications.js";

/**
 * Process a single Discord message and send notifications
 */
export const processMessage =
  (config: Config, logger: Logger) =>
  async (message: Message): Promise<void> => {
    logger.info(`🚨 SIGNAL ALERT from ${message.author.username}`);
    const title = `🚨 SIGNAL ALERT 🚨`;
    const content = `${message.author.username}: ${
      message.content || "(Attachment/Image)"
    }`;
    await sendNotifications(config, title, content, logger);
  };

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Initialize monitor state and get the latest message ID
 */
export const initializeMonitor = async (
  config: Config,
  logger: Logger
): Promise<string | null> => {
  logger.info("=== Discord Alert Monitor Started ===");
  logger.info(`Monitoring Channel ID: ${config.channelId}`);
  logger.info(`Mobile notifications to: ${config.ntfyTopic}`);

  const lastMessageId = await getLatestMessageId(config, logger);

  if (lastMessageId) {
    logger.info("Successfully connected to Discord");
    return lastMessageId;
  } else {
    logger.error("Failed to connect to Discord");
    return null;
  }
};

/**
 * Single polling cycle - fetch and process new messages
 */
export const pollOnce =
  (
    config: Config,
    logger: Logger,
    poller: ReturnType<typeof createDiscordPoller>
  ) =>
  async (state: MonitorState): Promise<MonitorState> => {
    try {
      const messages = await poller(state.lastMessageId);
      logger.debug(`Fetched ${messages.length} new message(s)`);

      // Process each message
      const messageProcessor = processMessage(config, logger);
      for (const message of messages) {
        await messageProcessor(message);
      }

      // Update state with the last message ID
      const updatedState: MonitorState = {
        ...state,
        lastMessageId:
          messages.length > 0
            ? messages[messages.length - 1].id
            : state.lastMessageId,
        messagesProcessed: state.messagesProcessed + messages.length,
      };

      return updatedState;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Poll cycle error: ${errorMessage}`);
      return state;
    }
  };

/**
 * Main monitor loop
 */
export const startMonitor = async (
  config: Config,
  logger: Logger
): Promise<void> => {
  const initialMessageId = await initializeMonitor(config, logger);

  if (!initialMessageId) {
    logger.error("Cannot start monitor without valid Discord connection");
    return;
  }

  const poller = createDiscordPoller(config, logger);
  const poll = pollOnce(config, logger, poller);

  let state: MonitorState = {
    isRunning: true,
    lastMessageId: initialMessageId,
    messagesProcessed: 0,
    startTime: new Date(),
  };

  logger.info("Monitor running. Press Ctrl+C to stop.");

  // Set up graceful shutdown
  const gracefulShutdown = (): void => {
    logger.info("Stopping monitor...");
    const uptime = Math.round((Date.now() - state.startTime.getTime()) / 1000);
    logger.info(
      `Monitor stopped. Uptime: ${uptime}s, Messages processed: ${state.messagesProcessed}`
    );
    process.exit(0);
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);

  // Main loop
  while (state.isRunning) {
    state = await poll(state);
    await sleep(config.checkInterval * 1000);
  }
};

/**
 * Create a monitor instance (functional composition)
 */
export const createMonitor = (config: Config, logger: Logger) => ({
  initialize: () => initializeMonitor(config, logger),
  poll: (state: MonitorState) =>
    pollOnce(config, logger, createDiscordPoller(config, logger))(state),
  start: () => startMonitor(config, logger),
});

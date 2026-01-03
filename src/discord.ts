import axios, { AxiosError } from "axios";
import { Config, Message, DiscordApiResponse, Logger } from "./types.js";

const DISCORD_API_BASE = "https://discord.com/api/v9";

/**
 * Build Discord API headers with authentication
 */
const buildHeaders = (token: string): Record<string, string> => ({
  authorization: token,
});

/**
 * Transform Discord API response to internal Message type
 */
const transformDiscordMessage = (msg: DiscordApiResponse): Message => ({
  id: msg.id,
  content: msg.content,
  author: {
    username: msg.author.username,
    id: msg.author.id,
  },
  timestamp: msg.timestamp,
});

/**
 * Get the latest message ID from a channel
 */
export const getLatestMessageId = async (
  config: Config,
  logger: Logger
): Promise<string | null> => {
  const url = `${DISCORD_API_BASE}/channels/${config.channelId}/messages?limit=1`;
  const metaBase = { action: "getLatestMessageId", channelId: config.channelId, url };
  const start = Date.now();
  logger.debug("Requesting latest message id", metaBase);

  try {
    const response = await axios.get<DiscordApiResponse[]>(url, {
      headers: buildHeaders(config.discordToken),
      timeout: config.requestTimeout * 1000,
    });

    const elapsedMs = Date.now() - start;
    const messages = response.data;
    const result = messages && messages.length > 0 ? messages[0].id : null;

    logger.info("Received latest message id", {
      ...metaBase,
      durationMs: elapsedMs,
      result,
      status: response.status,
    });

    return result;
  } catch (error) {
    const err = error as AxiosError;
    const elapsedMs = Date.now() - start;

    if (err.response?.status === 401) {
      logger.error("Authentication failed: Invalid Discord token", {
        ...metaBase,
        status: err.response?.status,
        durationMs: elapsedMs,
      });
      throw new Error("Authentication failed: Invalid Discord token");
    }

    logger.error("Failed to get latest message ID", {
      ...metaBase,
      durationMs: elapsedMs,
      status: err.response?.status,
      code: err.code,
      error: err.message,
      stack: err.stack,
    });

    return null;
  }
};

/**
 * Fetch messages after a specific message ID
 */
export const fetchMessagesAfter = async (
  config: Config,
  afterMessageId: string,
  logger: Logger
): Promise<Message[]> => {
  const url = `${DISCORD_API_BASE}/channels/${config.channelId}/messages?after=${afterMessageId}`;
  const metaBase = { action: "fetchMessagesAfter", channelId: config.channelId, afterMessageId, url };
  const start = Date.now();
  logger.debug("Fetching messages after id", metaBase);

  try {
    const response = await axios.get<DiscordApiResponse[]>(url, {
      headers: buildHeaders(config.discordToken),
      timeout: config.requestTimeout * 1000,
    });

    const elapsedMs = Date.now() - start;
    const data = response.data || [];
    const messages = data.reverse().map(transformDiscordMessage);

    logger.info("Fetched messages", {
      ...metaBase,
      durationMs: elapsedMs,
      count: messages.length,
      firstId: messages.length > 0 ? messages[0].id : null,
      lastId: messages.length > 0 ? messages[messages.length - 1].id : null,
      status: response.status,
    });

    return messages;
  } catch (error) {
    const err = error as AxiosError;
    const elapsedMs = Date.now() - start;

    if (err.response?.status === 401) {
      logger.error("Authentication failed: Invalid Discord token", {
        ...metaBase,
        status: err.response?.status,
        durationMs: elapsedMs,
      });
      throw new Error("Authentication failed: Invalid Discord token");
    }

    if (err.response?.status === 429) {
      logger.warn("Rate limited by Discord API", { ...metaBase, status: 429, durationMs: elapsedMs });
      return [];
    }

    logger.error("Failed to fetch messages", {
      ...metaBase,
      durationMs: elapsedMs,
      status: err.response?.status,
      code: err.code,
      error: err.message,
      stack: err.stack,
    });

    return [];
  }
};

/**
 * Pipe Discord API calls with error recovery
 */
export const createDiscordPoller =
  (config: Config, logger: Logger) =>
  async (lastMessageId: string | null): Promise<Message[]> => {
    if (!lastMessageId) {
      return [];
    }

    const messages = await fetchMessagesAfter(config, lastMessageId, logger);
    return messages;
  };

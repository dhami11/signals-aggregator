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
  try {
    const url = `${DISCORD_API_BASE}/channels/${config.channelId}/messages?limit=1`;
    const response = await axios.get<DiscordApiResponse[]>(url, {
      headers: buildHeaders(config.discordToken),
      timeout: config.requestTimeout * 1000,
    });

    const messages = response.data;
    return messages && messages.length > 0 ? messages[0].id : null;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      logger.error("Invalid Discord token");
      throw new Error("Authentication failed: Invalid Discord token");
    }
    logger.error(`Failed to get latest message ID: ${err.message}`);
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
  try {
    const url = `${DISCORD_API_BASE}/channels/${config.channelId}/messages?after=${afterMessageId}`;
    const response = await axios.get<DiscordApiResponse[]>(url, {
      headers: buildHeaders(config.discordToken),
      timeout: config.requestTimeout * 1000,
    });

    const messages = response.data || [];

    // Return messages sorted from oldest to newest
    return messages.reverse().map(transformDiscordMessage);
  } catch (error) {
    const err = error as AxiosError;

    if (err.response?.status === 401) {
      logger.error("Invalid Discord token");
      throw new Error("Authentication failed: Invalid Discord token");
    }

    if (err.response?.status === 429) {
      logger.warn("Rate limited by Discord API");
      return [];
    }

    logger.error(`Failed to fetch messages: ${err.message}`);
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

/**
 * Type definitions for Discord Alert Monitor
 */

export interface Config {
  discordToken: string;
  channelId: string;
  ntfyTopic: string;
  checkInterval: number;
  logLevel: LogLevel;
  requestTimeout: number;
}

export interface Message {
  id: string;
  content: string;
  author: {
    username: string;
    id: string;
  };
  timestamp: string;
}

export interface NotificationResult {
  success: boolean;
  channel: "desktop" | "mobile";
  error?: string;
}

export interface DiscordApiResponse {
  id: string;
  content: string;
  author: {
    username: string;
    id: string;
  };
  timestamp: string;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export interface MonitorState {
  isRunning: boolean;
  lastMessageId: string | null;
  messagesProcessed: number;
  startTime: Date;
}

/**
 * Type definitions for Discord Alert Monitor
 */

export interface Config {
  discordToken: string;
  channelId: string;
  ntfyTopic: string;
  checkInterval: number;
  logLevel: LogLevel;
  logFormat: "plain" | "json";
  requestTimeout: number;
  enableDesktopNotifications: boolean;
  enableMobileNotifications: boolean;
}

export interface LogMeta {
  [key: string]: any;
}

export interface Logger {
  debug: (message: string, meta?: LogMeta) => void;
  info: (message: string, meta?: LogMeta) => void;
  warn: (message: string, meta?: LogMeta) => void;
  error: (message: string, meta?: LogMeta) => void;
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

export interface MonitorState {
  isRunning: boolean;
  lastMessageId: string | null;
  messagesProcessed: number;
  startTime: Date;
}

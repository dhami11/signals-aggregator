import axios from "axios";
import { execSync } from "child_process";
import { platform } from "os";
import { Config, NotificationResult, Logger } from "./types.js";

/**
 * Escape single quotes for shell commands
 */
const escapeForShell = (str: string): string => str.replace(/'/g, "'\"'\"'");

/**
 * Send desktop notification on macOS using osascript
 */
const sendMacOsNotification = (
  title: string,
  message: string,
  logger: Logger
): void => {
  try {
    const escapedTitle = escapeForShell(title);
    const escapedMessage = escapeForShell(message);
    const script = `display notification "${escapedMessage}" with title "${escapedTitle}"`;
    execSync(`osascript -e '${script}'`, {
      timeout: 5000,
    });
  } catch (error) {
    logger.error(
      `Failed to send macOS notification: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Send desktop notification on Windows using PowerShell
 */
const sendWindowsNotification = (
  title: string,
  message: string,
  logger: Logger
): void => {
  try {
    const escapedTitle = title.replace(/"/g, '`"');
    const escapedMessage = message.replace(/"/g, '`"');
    const ps = `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show("${escapedMessage}", "${escapedTitle}")`;
    execSync(`powershell -Command "${ps}"`, { timeout: 5000 });
  } catch (error) {
    logger.error(
      `Failed to send Windows notification: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Send desktop notification on Linux using notify-send
 */
const sendLinuxNotification = (
  title: string,
  message: string,
  logger: Logger
): void => {
  try {
    const escapedTitle = title.replace(/"/g, '\\"');
    const escapedMessage = message.replace(/"/g, '\\"');
    execSync(`notify-send "${escapedTitle}" "${escapedMessage}"`, {
      timeout: 5000,
    });
  } catch (error) {
    logger.error(
      `Failed to send Linux notification: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

/**
 * Send native desktop notification based on OS
 */
const sendDesktopNotification = async (
  title: string,
  message: string,
  logger: Logger
): Promise<NotificationResult> => {
  try {
    const os = platform();

    switch (os) {
      case "darwin": // macOS
        sendMacOsNotification(title, message, logger);
        break;
      case "win32": // Windows
        sendWindowsNotification(title, message, logger);
        break;
      case "linux": // Linux
        sendLinuxNotification(title, message, logger);
        break;
      default:
        logger.warn(`Desktop notifications not supported on ${os}`);
        return {
          success: false,
          channel: "desktop",
          error: `Unsupported OS: ${os}`,
        };
    }

    return { success: true, channel: "desktop" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Desktop notification error: ${errorMessage}`);
    return {
      success: false,
      channel: "desktop",
      error: errorMessage,
    };
  }
};

/**
 * Send notification to mobile device via ntfy.sh
 */
export const sendMobileNotification = async (
  config: Config,
  title: string,
  message: string,
  logger: Logger
): Promise<NotificationResult> => {
  try {
    const url = `https://ntfy.sh/${config.ntfyTopic}`;
    const content = `${title}: ${message}`;

    await axios.post(url, content, {
      headers: {
        Title: "Discord Alert",
        Priority: "high",
      },
      timeout: config.requestTimeout * 1000,
    });

    return { success: true, channel: "mobile" };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to send mobile notification: ${errorMessage}`);
    return {
      success: false,
      channel: "mobile",
      error: errorMessage,
    };
  }
};

/**
 * Send notifications to enabled channels
 */
export const sendNotifications = async (
  config: Config,
  title: string,
  message: string,
  logger: Logger
): Promise<NotificationResult[]> => {
  const results: NotificationResult[] = [];

  // Send mobile notification if enabled
  if (config.enableMobileNotifications) {
    results.push(await sendMobileNotification(config, title, message, logger));
  }

  // Send desktop notification if enabled
  if (config.enableDesktopNotifications) {
    results.push(await sendDesktopNotification(title, message, logger));
  }

  const successCount = results.filter((r) => r.success).length;
  logger.debug(
    `Notifications sent: ${successCount}/${results.length} channels successful`
  );

  return results;
};

# Discord Alert Monitor - TypeScript

Professional-grade Discord message monitoring with desktop and mobile notifications, written in TypeScript using functional programming patterns.

## Features

- ✅ **Real-time Monitoring**: Polls Discord for new messages in specified channels
- ✅ **Multi-channel Notifications**: Desktop (macOS/Windows) + Mobile (ntfy.sh)
- ✅ **Functional Programming**: Pure functions, no classes, composition-based architecture
- ✅ **Type Safety**: Full TypeScript with strict type checking
- ✅ **Structured Logging**: Timestamped, leveled logging throughout
- ✅ **Environment Configuration**: `.env` based config management
- ✅ **Error Resilience**: Graceful error handling and recovery

## Architecture

Built with **functional programming principles**:

- Pure functions for side effects (notifications, API calls)
- Function composition and pipelines
- Immutable data structures
- No mutable state or class instances
- Higher-order functions for abstraction

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
NTFY_TOPIC=your_notification_topic
CHECK_INTERVAL=5
LOG_LEVEL=info
```

### 3. Development

```bash
npm run dev
```

### 4. Production Build

```bash
npm run build
npm start
```

## Docker Deployment

### Local Testing

```bash
docker-compose up
```

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide covering:

- ✅ Railway (easiest, recommended)
- ✅ Render
- ✅ Fly.io
- ✅ Local VPS options

**TL;DR**: Push to GitHub → connect to Railway → add env vars → deployed! 🚀

```bash
npm run build
npm start
```

## Configuration

| Variable             | Required | Default | Description                          |
| -------------------- | -------- | ------- | ------------------------------------ |
| `DISCORD_TOKEN`      | Yes      | -       | Discord bot/user token               |
| `DISCORD_CHANNEL_ID` | Yes      | -       | Channel ID to monitor                |
| `NTFY_TOPIC`         | Yes      | -       | Topic for ntfy.sh notifications      |
| `CHECK_INTERVAL`     | No       | 5       | Polling interval in seconds          |
| `LOG_LEVEL`          | No       | info    | Log level (debug, info, warn, error) |

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Configuration management
├── logger.ts             # Logging utilities
├── discord.ts            # Discord API functions
├── notifications.ts      # Notification delivery functions
├── monitor.ts            # Main monitoring orchestration
└── types.ts              # TypeScript type definitions
```

## Key Functions

### `loadConfig(): Config`

Loads configuration from environment variables with validation.

### `createLogger(level: LogLevel): Logger`

Returns a logger function with the specified level.

### `fetchDiscordMessages(config: Config): Promise<Message[]>`

Polls Discord API for new messages.

### `sendDesktopNotification(title: string, message: string): Promise<void>`

Sends native desktop notification (macOS/Windows).

### `sendMobileNotification(config: Config, title: string, message: string): Promise<void>`

Sends notification via ntfy.sh to mobile device.

### `processMessage(msg: Message, config: Config): Promise<void>`

Handles message processing and notification delivery.

### `startMonitor(config: Config): Promise<void>`

Main monitoring loop with error handling.

## Type Safety

Full TypeScript with strict mode:

- All functions have explicit parameter and return types
- Discriminated unions for type-safe message handling
- Error types for better error handling

## Security

⚠️ **Never commit `.env` file**

Add to `.gitignore`:

```
.env
dist/
node_modules/
*.log
```

## Development

- Use `npm run dev` for development with ts-node
- Use `npm run build` to compile TypeScript to JavaScript
- Use `npm run lint` for code linting
- Use `npm run test` to run tests

## Notifications

### Desktop

- **macOS**: Uses native AppleScript via `osascript`
- **Windows**: Uses `powershell` notification
- **Linux**: Uses `notify-send` if available

### Mobile

- Sent via [ntfy.sh](https://ntfy.sh/) service
- No account needed, just subscribe to the topic in the app

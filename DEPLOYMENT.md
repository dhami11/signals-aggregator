# Discord Alert Monitor - Deployment Guide

Your first deployment! Here's everything you need to know. 🚀

## Table of Contents

1. [Local Docker Testing](#local-docker-testing)
2. [Free Deployment Platforms](#free-deployment-platforms)
3. [Deployment Instructions](#deployment-instructions)
4. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Local Docker Testing

### What is Docker?

Docker packages your app and all dependencies into a **container** - a lightweight, isolated environment that runs the same everywhere (your laptop, server, cloud).

Think of it like shipping your app in a box with everything it needs inside.

### Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Make sure `.env` file exists with your credentials

### Test Locally

```bash
# Build the Docker image (creates the box)
docker build -t discord-monitor .

# Run the container (opens the box and runs the app)
docker run --env-file .env discord-monitor

# Or use docker-compose (easier)
docker-compose up

# View logs
docker-compose logs -f

# Stop it
docker-compose down
```

### Understanding the Dockerfile

```dockerfile
# Build stage: Compile TypeScript
FROM node:22-alpine AS builder
RUN npm run build

# Production stage: Run the app
FROM node:22-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**Why two stages?**

- **Builder stage**: Includes TypeScript compiler (heavy, not needed at runtime)
- **Production stage**: Only has compiled JavaScript (lightweight, ~100MB)

Result: Your Docker image is small and fast! ⚡

---

## Free Deployment Platforms

### Option 1: **Railway** ⭐ Recommended for Beginners

- ✅ **Free tier**: $5/month credit (usually enough)
- ✅ Easy GitHub integration
- ✅ 1-click deployment
- ✅ Built-in environment variables management
- ✅ Good for this use case (low resource usage)
- 🌐 https://railway.app

### Option 2: **Render**

- ✅ **Free tier**: Limited but available
- ✅ GitHub integration
- ✅ Docker support
- ✅ Environment variables UI
- 🌐 https://render.com

### Option 3: **Fly.io**

- ✅ **Free tier**: 3 shared CPU cores, 3GB RAM
- ✅ Docker native
- ✅ Global deployment
- 🌐 https://fly.io

### Option 4: **Heroku Alternative - Back4app**

- ✅ **Free tier**: Similar to old Heroku
- ✅ GitHub integration
- 🌐 https://www.back4app.com

### Option 5: **VPS (Most Control)**

- **DigitalOcean** or **Linode**: $5/month (not free, but cheapest)
- **Oracle Cloud**: Actually free tier (complicated setup)
- **AWS EC2**: Free tier for 12 months

---

## Deployment Instructions

### **Railway (Easiest - Recommended)**

#### Step 1: Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "initial commit"

# Push to GitHub
git push -u origin main
```

#### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your `ts-discord-alert` repository
6. Railway detects the Dockerfile automatically
7. Click "Deploy"

#### Step 3: Add Environment Variables

1. In Railway dashboard, go to your project
2. Click "Variables"
3. Add each from your `.env`:
   ```
   DISCORD_TOKEN=your_token_here
   DISCORD_CHANNEL_ID=your_channel_id
   NTFY_TOPIC=your_topic
   CHECK_INTERVAL=5
   LOG_LEVEL=info
   ```
4. Save - Railway redeploys automatically

#### Step 4: Monitor

- Railway shows real-time logs
- CPU/Memory usage
- Deployment status

---

### **Render (Simple Alternative)**

#### Step 1: Create Background Worker

1. Go to [render.com](https://render.com)
2. Click "New +"
3. Select "Background Worker"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `discord-alert-monitor`
   - **Environment**: Docker
   - **Branch**: `main`

#### Step 2: Add Environment Variables

1. Scroll down to "Environment"
2. Add your variables
3. Click "Create Background Worker"

---

### **Fly.io (Most Powerful)**

#### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

#### Step 2: Deploy

```bash
fly launch
# Follow prompts:
# - App name: discord-alert-monitor
# - Region: choose closest to you
# - Deploy?: yes

fly secrets set DISCORD_TOKEN=your_token_here
fly secrets set DISCORD_CHANNEL_ID=your_channel_id
fly secrets set NTFY_TOPIC=your_topic

fly deploy
```

#### Step 3: Monitor

```bash
fly logs
fly status
```

---

## Monitoring & Troubleshooting

### View Logs

```bash
# Railway
railway logs

# Render
# Via dashboard web UI

# Fly.io
fly logs

# Local Docker
docker-compose logs -f
```

### Check if Running

```bash
# Local Docker
docker ps

# Railway/Render/Fly
# Via their dashboard
```

### Restart

```bash
# Local Docker
docker-compose restart

# Railway: Click restart button
# Render: Click restart button
# Fly.io
fly apps restart discord-alert-monitor
```

### Stop

```bash
# Local Docker
docker-compose down

# Railway/Render/Fly
# Disable in dashboard (or destroy)
```

### Debug Issues

**Container won't start?**

```bash
docker-compose logs  # See error message
```

**Environment variables not loading?**

```bash
# Verify in platform dashboard
# Make sure LOG_LEVEL=debug to see more info
```

**App crashes after deploy?**

1. Check logs for error
2. Verify all env vars are set
3. Make sure Discord token is still valid

---

## Environment Variables Reference

| Variable             | Required | Example            | Description               |
| -------------------- | -------- | ------------------ | ------------------------- |
| `DISCORD_TOKEN`      | Yes      | `NzEzNTMwNjc...`   | Your bot token            |
| `DISCORD_CHANNEL_ID` | Yes      | `796131237794...`  | Channel to monitor        |
| `NTFY_TOPIC`         | Yes      | `naz-signal-alert` | Mobile notification topic |
| `CHECK_INTERVAL`     | No       | `5`                | Poll interval (seconds)   |
| `LOG_LEVEL`          | No       | `info`             | debug, info, warn, error  |
| `REQUEST_TIMEOUT`    | No       | `10`               | HTTP timeout (seconds)    |

---

## Costs

| Platform     | Free Tier       | Cost if Over                  |
| ------------ | --------------- | ----------------------------- |
| Railway      | $5/month credit | $0.10/CPU hour, $0.10/GB hour |
| Render       | Limited         | $0.10/hour+                   |
| Fly.io       | 3 shared cores  | $0.10/GB memory/hour          |
| DigitalOcean | None            | $5/month                      |
| Heroku       | None (removed)  | Was $7/month                  |

**For your app**: Expect $0-5/month on any platform (very lightweight)

---

## Next Steps

1. **Test locally first**: `docker-compose up`
2. **Choose a platform**: Railway is easiest
3. **Create GitHub repo**: Push your code
4. **Deploy**: Connect repo to platform
5. **Monitor**: Check logs periodically
6. **Celebrate**: You deployed your first backend! 🎉

---

## FAQ

**Q: Will the app keep running 24/7?**
A: Yes! On any platform. Docker containers run continuously until you stop them.

**Q: What if Discord token expires?**
A: Update it in the platform's environment variables dashboard, and it redeploys automatically.

**Q: Can I update the code?**
A: Push to GitHub → platform automatically rebuilds and redeploys (if set to auto-deploy).

**Q: How do I stop it?**
A: Disable or destroy it in the platform's dashboard (or `docker-compose down` locally).

**Q: Can I run multiple instances?**
A: Most platforms support scaling. For a monitor app, 1 instance is enough.

**Q: What about security?**
A: Environment variables are encrypted. Docker image is private by default. Token never appears in logs.

---

## Success Checklist

- [ ] Dockerfile builds locally: `docker build -t discord-monitor .`
- [ ] docker-compose runs: `docker-compose up`
- [ ] Logs show "Successfully connected to Discord"
- [ ] GitHub repo created and pushed
- [ ] Platform account created (Railway/Render/Fly)
- [ ] Repository connected to platform
- [ ] Environment variables added
- [ ] Deployment successful
- [ ] Platform logs show "Successfully connected to Discord"
- [ ] App receives a test Discord message and sends notification

---

Need help? Check your platform's documentation:

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)

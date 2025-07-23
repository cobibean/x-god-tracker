# X God Tracker

A modern dashboard for tracking daily activities and performance metrics.

## Features

- 📋 Daily Checklist - Track your daily tasks
- ⏰ Operating Rhythm - Time-boxed execution blocks
- 🎯 Action Logger - Track key actions with targets
- 📊 Daily Scoring - Performance scoring system
- 🎮 Playbook Reference - Quick access to your strategies
- 🎨 Beautiful UI with animated components

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Production Deployment

⚠️ **Important**: The default SQLite database only works in development. For production deployment on Vercel, you need to set up a PostgreSQL database.

### Quick Setup with Vercel Postgres

1. Deploy to Vercel
2. Go to your project's Storage tab
3. Create a Postgres database
4. Redeploy your project

The app will automatically use PostgreSQL when `POSTGRES_URL` is set.

### Alternative Database Options

- **Neon** - Free PostgreSQL hosting
- **Supabase** - Free PostgreSQL with additional features
- **PlanetScale** - Serverless MySQL

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

## Configuration

The admin dashboard (`/admin`) allows you to configure:
- Daily checklist tasks
- Operating rhythm timer blocks
- Action types and targets
- Scoring weights and messages

## Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- SQLite (development) / PostgreSQL (production)
- Framer Motion
- React DnD Kit

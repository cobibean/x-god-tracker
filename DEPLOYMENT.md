# Deployment Guide for X God Tracker

## Deploying to Vercel with Persistent Storage

### Problem with SQLite on Vercel
The current development setup uses SQLite, which won't work on Vercel because:
- Vercel's serverless functions are ephemeral
- No persistent file storage
- Any changes to files are lost when functions shut down

### Solution: Use PostgreSQL

## Step 1: Set up PostgreSQL Database

### Option A: Vercel Postgres (Recommended - Easy Setup)
1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Storage" tab
4. Click "Create Database" → "Postgres"
5. Follow the setup wizard
6. Vercel will automatically add the `POSTGRES_URL` environment variable

### Option B: Neon (Free Tier Available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to Vercel environment variables:
   ```
   POSTGRES_URL=your_neon_connection_string
   ```

### Option C: Supabase (Free Tier Available)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add to Vercel environment variables:
   ```
   POSTGRES_URL=your_supabase_connection_string
   ```

## Step 2: Deploy to Vercel

### Using Vercel CLI:
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add POSTGRES_URL
```

### Using GitHub Integration:
1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the `POSTGRES_URL` environment variable in project settings
4. Deploy

## Step 3: Verify Deployment

After deployment:
1. Visit your production URL
2. Go to `/admin/test`
3. Test saving configurations
4. Check that changes persist after page reload

## Alternative Solutions

### Option 2: Use Redis (Upstash)
For simpler key-value storage:
1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Use `@upstash/redis` SDK
4. Modify `db.ts` to use Redis instead of SQL

### Option 3: Use Edge Config
For read-heavy configurations:
1. Use Vercel Edge Config
2. Best for configurations that rarely change
3. Very fast reads globally

### Option 4: Use External CMS
For non-technical users:
1. Use a headless CMS (Sanity, Contentful)
2. Manage configurations through their UI
3. Fetch via API

## Environment Variables

Required for production:
```env
# For PostgreSQL
POSTGRES_URL=your_postgres_connection_string

# Optional: For different database per environment
POSTGRES_URL_NON_POOLING=your_direct_connection_string
```

## Local Development

The app automatically uses SQLite in development when `POSTGRES_URL` is not set.

To test PostgreSQL locally:
1. Install PostgreSQL locally or use Docker
2. Create a `.env.local` file:
   ```env
   POSTGRES_URL=postgresql://user:password@localhost:5432/xgod
   ```
3. Run `npm run dev`

## Troubleshooting

### "Cannot find module 'better-sqlite3'" in production
- This is expected if using PostgreSQL
- The app conditionally loads the appropriate database driver

### Changes not persisting in production
- Check that `POSTGRES_URL` is set in Vercel environment variables
- Check Vercel function logs for database connection errors
- Ensure the database tables were created (check logs on first deploy)

### Performance issues
- Enable connection pooling in your database
- Consider caching frequently accessed configs
- Use Vercel Edge Config for read-heavy data 
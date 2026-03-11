# ChannelBridge

Slack-to-Box file sync manager. Automatically syncs files shared in Slack channels to designated Box folders.

## Architecture

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** Express + Slack Web API + Box Node SDK + Supabase

## Prerequisites

- Node.js 18+
- Supabase project
- Slack App with Bot Token
- Box App with JWT authentication

## Supabase Schema

Run this SQL in your Supabase SQL editor:

```sql
create table mappings (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  tags text[] default '{}',
  slack_channel_id text not null,
  slack_channel_name text not null,
  box_folder_id text not null,
  box_folder_name text not null,
  status text not null default 'active',
  created_at timestamptz default now()
);

create table sync_logs (
  id uuid primary key default gen_random_uuid(),
  mapping_id uuid references mappings(id) on delete cascade,
  file_id text not null,
  file_name text not null,
  box_file_id text,
  status text not null,
  error text,
  created_at timestamptz default now()
);
```

## Slack App Setup

1. Create a new Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Under **OAuth & Permissions**, add bot scopes: `channels:read`, `files:read`, `groups:read`
3. Under **Event Subscriptions**, enable events and set the request URL to `https://your-server.com/slack/events`
4. Subscribe to the `file_shared` bot event
5. Install the app to your workspace
6. Copy the **Bot Token** and **Signing Secret** to your `.env`

## Box App Setup (JWT)

1. Create a new Box App at [developer.box.com](https://developer.box.com)
2. Select **Server Authentication (with JWT)**
3. Generate a public/private keypair in the app configuration
4. Authorize the app in the Box Admin Console
5. Copy credentials to your `.env` — for the private key, replace actual newlines with `\n`

## Local Development

```bash
# Copy env vars
cp .env.example server/.env

# Backend
cd server
npm install
npm run dev

# Frontend (separate terminal)
cd client
npm install
npm run dev
```

Server runs on `http://localhost:3001`, frontend on `http://localhost:5173`.

## Deploy

### Backend (Render)

1. Create a new Web Service pointing to the `server/` directory
2. Build command: `npm install`
3. Start command: `node index.js`
4. Add all environment variables from `.env.example`

### Frontend (Vercel)

1. Import the repo, set root directory to `client/`
2. Framework preset: Vite
3. Add environment variable `VITE_API_URL` pointing to your Render backend URL

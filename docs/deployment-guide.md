# Deployment Guide

This guide covers local setup and a minimal production baseline for the current Next.js + Prisma + SQLite architecture.

## Prerequisites

- Node.js 20+
- npm 10+

## Environment Variables

Required:
- `DATABASE_URL` (example: `file:./dev.db`)
- `JWT_SECRET` (long random secret in production)

Optional (required for BullMQ worker/queue):
- `REDIS_URL` (recommended, example: `redis://127.0.0.1:6379`)
- or `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

Start from:
- `.env.example`

## Local Development

1) Install dependencies:

```bash
npm install
```

2) Configure env:

```bash
cp .env.example .env
```

3) Generate Prisma client (also runs in `postinstall`):

```bash
npm run prisma:generate
```

4) Run dev server:

```bash
npm run dev
```

If you use month-end auto-transfer queue locally, start Redis:

```bash
docker compose up -d redis
```

App URL:
- `http://localhost:3000`

## Production Build

Build:

```bash
npm run build
```

Start:

```bash
npm run start
```

## Deployment Notes

- Session cookie is marked `secure` in production mode.
- Do not deploy with default `JWT_SECRET`.
- Ensure the SQLite database path in `DATABASE_URL` is writable on the host.
- If BullMQ worker is enabled, ensure Redis is reachable via `REDIS_URL` (or host/port/password fallback).

## Current Infrastructure Constraints

- SQLite is acceptable for MVP and low-concurrency workloads.
- For higher write concurrency or horizontal scaling, plan migration to Postgres.
- No dedicated deployment automation pipeline is documented yet.

## Post-Deploy Verification Checklist

- open `/login` and `/register`
- verify protected route redirect behavior for `/app`
- verify authenticated access to `/api/accounts`
- create a transaction and confirm dashboard/ledger updates
- verify `/api/auth/logout` clears session and redirects flows behave correctly

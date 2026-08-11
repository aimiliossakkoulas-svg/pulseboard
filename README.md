# Social Media Starter

This project now includes a React + Vite frontend and a Node.js + Express backend that connects to PostgreSQL.
It is a CompanyBoard-inspired social platform for ranked company profiles, selective metric sharing, HubSpot metrics, meetings, marketplace vendors, and structured collaboration workflows.

CompanyBoard's positioning is rooted in niche-market collaboration: companies can surface credible operating context, identify complementary partners, and pursue partnerships where both sides gain value through a defined scope rather than generic networking or charity-style consulting.

## Features
- Feed UI for creating and viewing posts
- REST API for posts
- PostgreSQL schema for storing posts
- Ready for deployment on AWS with a frontend build and backend service

## Setup
1. Install dependencies:
   npm install
2. Create a PostgreSQL database named socialdb and run the SQL in server/schema.sql.
3. Start the backend:
   npm run dev:server
4. Start the frontend:
   npm run dev

## Local-First Roadmap (50 dollars/month cap)
Use local development as the default path, then deploy a lean public stack only when needed.

### Phase 1 complete
- Local persistence for users, posts, and companies is enabled in the backend store.

### Phase 2: Local backup and restore
1. Create a backup snapshot:
   npm run backup:store
2. Restore the latest backup:
   npm run restore:store
3. Restore a specific backup file:
   npm run restore:store -- ./server/backups/store-YYYY-MM-DDTHH-MM-SS.json

### Phase 3: One-command local stack (Docker Compose)
1. Start the full stack:
   npm run docker:up
2. Start the full stack in the background so it survives VS Code reloads:
   npm run docker:up:detached
3. Stop the stack:
   npm run docker:down
4. Reload running containers without removing volumes:
   npm run docker:reload
5. Reset the stack with a rebuild while preserving persisted data:
   npm run docker:reset
6. Remove containers and named volumes for a clean slate:
   npm run docker:clean
7. Verify web, API, auth, protected writes, and persistence after restart:
   npm run docker:verify
8. Stream logs:
   npm run docker:logs
9. Rebuild and restart the stack in the background:
   npm run docker:restart

Services started by Docker Compose:
- Web app at http://localhost:3000
- API at http://localhost:5000

Detached Docker is the recommended local workflow when you want the app to stay up after closing or reloading VS Code. The containers keep running until you stop them with `npm run docker:down`.

The verification script is meant to be a lightweight smoke test for your local Docker workflow. It checks the web app, API health endpoint, auth signup, protected post creation, and whether a created post survives an API container restart.

## Suggested production stack
- Frontend: Vite + React deployed to AWS S3 + CloudFront
- Backend: Node.js on AWS EC2 or ECS
- Database: Amazon RDS for PostgreSQL
- Storage: S3 for media uploads

## Stripe billing setup (Railway)
To enable paid consultancy milestones in production, set these backend environment variables:

1. STRIPE_SECRET_KEY
2. STRIPE_WEBHOOK_SECRET
3. WEB_BASE_URL

Optional API service variable:
1. STRIPE_MANAGED_PAYMENTS_ENABLED (default false)

Example values:
- STRIPE_MANAGED_PAYMENTS_ENABLED=false

Webhook endpoint to configure in Stripe:
- Keep STRIPE_MANAGED_PAYMENTS_ENABLED=false unless your Stripe managed payments setup is fully configured.

Notes:
- If Stripe keys are not set, checkout falls back to manual funding mode so the workflow still works.
- Webhook processing is idempotent. Duplicate delivery events are safely ignored.

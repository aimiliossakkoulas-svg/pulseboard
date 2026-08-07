# Social Media Starter

This project now includes a React + Vite frontend and a Node.js + Express backend that connects to PostgreSQL.
It is a PulseBoard-inspired social platform for ranked company profiles, selective metric sharing, HubSpot metrics, meetings, and marketplace vendors.

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

## Suggested production stack
- Frontend: Vite + React deployed to AWS S3 + CloudFront
- Backend: Node.js on AWS EC2 or ECS
- Database: Amazon RDS for PostgreSQL
- Storage: S3 for media uploads

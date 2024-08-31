# Novum Video Sharing Platform

Novum is a modern video sharing platform built with Next.js, NestJS, and TypeScript. It allows users to upload, view, and interact with videos in a user-friendly interface.

# Video streaming tech

Platform uses HLS streaming for better experience. I'm transcoding videos to multiple qualities, creating HLS playlists and segments, and enabling adaptive streaming.

## Project Structure

This project is set up as a monorepo using npm workspaces. It consists of the following packages:

- `packages/frontend`: Next.js-based frontend application
- `packages/backend`: NestJS-based backend API
- `packages/shared`: Shared types and utilities used by both frontend and backend

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose (for running the database and other services)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/chetanxpro/novum.git
   cd novum
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in both `packages/frontend` and `packages/backend`
   - Fill in the necessary environment variables

4. Start the development servers:
   ```
   npm run dev
   ```

   This will start both the frontend and backend in development mode.

5. Open your browser and navigate to `http://localhost:3000` to see the application running.

## Scripts

- `npm run dev`: Start both frontend and backend in development mode
- `npm run build`: Build all packages
- `npm run start`: Start both frontend and backend in production mode
- `npm run test:backend`: Run backend tests
- `npm run migrate`: Run Prisma migrations
- `npm run generate`: Generate Prisma client
- `npm run docker:up`: Start Docker services
- `npm run docker:down`: Stop Docker services
- `npm run lint`: Run linting across all packages


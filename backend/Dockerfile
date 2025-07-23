# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install dependencies
FROM base AS deps

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./backend/
COPY packages/db/ ./packages/db/

WORKDIR /app/backend
RUN npm install --production

# 3. Runner Stage: Final, smaller image for running the app
FROM base AS runner

WORKDIR /app

COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/db/ ./packages/db/
COPY backend/ ./backend/
COPY types/ ./types/

WORKDIR /app/backend
CMD ["npm", "start"]

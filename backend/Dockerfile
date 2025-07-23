# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install dependencies
FROM base AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./backend/
COPY packages/ ./packages/
WORKDIR /app/backend
RUN npm ci --only=production

# 3. Runner Stage: Final, smaller image for running the app
FROM base AS runner
WORKDIR /app

# Copy dependencies and packages first (these change less frequently)
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY --from=deps /app/packages/ ./packages/

# Copy source code last (this changes more frequently)
COPY backend/ ./backend/

WORKDIR /app/backend
CMD ["npm", "start"]

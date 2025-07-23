# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install dependencies
FROM base AS deps

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --production

# 3. Runner Stage: Final, smaller image for running the app
FROM base AS runner

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
COPY types/ ./types

CMD ["npm", "start"]
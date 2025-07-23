# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package.json files for all packages
COPY frontend/package.json frontend/package-lock.json* ./frontend/
COPY packages/db/package.json packages/db/package-lock.json* ./packages/db/
COPY packages/common/ ./packages/common/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Install db package dependencies
WORKDIR /app/packages/db
RUN npm install

# 3. Build Stage: Build the application
FROM base AS builder
WORKDIR /app

# Copy installed node_modules and source code
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
COPY --from=deps /app/packages/ ./packages/

# Copy frontend source code
COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN npm run build

# 4. Runner Stage: Final, smaller image for running the app
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/node_modules ./node_modules
COPY --from=builder /app/frontend/package.json ./package.json
COPY --from=builder /app/packages/ ./packages/

CMD ["npm", "start"]

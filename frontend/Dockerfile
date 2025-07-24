# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install all dependencies for building
FROM base AS deps
WORKDIR /app

# Copy all package manifests and the lock file to leverage Docker cache
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/

# Install all dependencies for all workspaces
RUN npm install

# 3. Build Stage: Build the frontend application
FROM base AS builder
WORKDIR /app

# Copy the installed node_modules and the entire monorepo source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the frontend application
RUN npm run build -w frontend

# 4. Runner Stage: Final, smaller image for running the app
FROM base AS runner
WORKDIR /app

# Copy package manifests from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/frontend/package.json ./frontend/
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/common/package.json ./packages/common/

# Install only production dependencies for all workspaces
RUN npm install --omit=dev

# Copy the built Next.js application and config from the builder stage
COPY --from=builder /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/next.config.ts ./frontend/next.config.ts

# Set the working directory to the frontend app
WORKDIR /app/frontend

# Expose the port the app runs on
EXPOSE 3000

CMD ["npm", "start"]

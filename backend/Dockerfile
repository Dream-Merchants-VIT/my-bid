# 1. Base Stage: Official Node.js image
FROM node:20-alpine AS base

# 2. Dependencies Stage: Install all workspace dependencies
FROM base AS deps
WORKDIR /app

# Copy all package manifests and the lock file
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/

# Copy source code for packages
COPY packages/ ./packages/
COPY backend/ ./backend/

# Install all dependencies for all workspaces
RUN npm install

# 3. Runner Stage: Final, smaller image for running the app
FROM base AS runner
WORKDIR /app

# Copy the installed node_modules and the backend source code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/ ./packages/
COPY --from=deps /app/backend/ ./backend/

# Set the working directory to the backend app
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE 8080

CMD ["npm", "start"]
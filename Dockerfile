# Use Node.js base image
FROM node:20-bullseye

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port
EXPOSE 3000

# Run both Next.js and WebSocket via concurrently
CMD ["npm", "start"]

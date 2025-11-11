# Base image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Production stage (optional for later)
FROM base AS prod
RUN npm ci --production
COPY . .
CMD ["node", "src/server.js"]

# Development stage
FROM base AS dev
# Install all dependencies including devDeps (nodemon)
RUN npm ci
COPY . .
# Default command for dev container
CMD ["npm", "run", "dev"]

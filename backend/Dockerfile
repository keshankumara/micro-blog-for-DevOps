# Multi-stage build for backend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ ./

# Expose port (matches .env BACKEND_PORT)
EXPOSE 5000

# Health check - use localhost, not public IP
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

# Run application
CMD ["node", "index.js"]

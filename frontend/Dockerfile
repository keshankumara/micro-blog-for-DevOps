# Multi-stage build for frontend
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build application with API URL
ARG REACT_APP_API_URL=http://microblog-backend:5000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://54.173.187.235/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

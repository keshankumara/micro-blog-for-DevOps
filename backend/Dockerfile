### Production-ready multi-stage Dockerfile for the Node/Express backend
### Goals:
### - produce a small image with only production deps
### - run as non-root user where possible
### - keep build cache layers efficient

FROM node:18-alpine AS deps
WORKDIR /app

# Install only production dependencies in a separate layer for caching
COPY package*.json ./
RUN npm ci --production --silent

FROM node:18-alpine AS runner
WORKDIR /app

# Set NODE_ENV to production by default; override with --env when running if needed
ENV NODE_ENV=production

# Create a non-root user (alpine) for improved security
RUN addgroup -S app && adduser -S app -G app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source
COPY . .

# Make sure files are owned by the non-root user and switch to it
RUN chown -R app:app /app
USER app

# Expose the same port the app uses by default (can be overridden by PORT env var)
EXPOSE 5000

# Use a simple, explicit command so PID 1 receives signals
# Note: server entry is `src/server.js` in this project. If different, change accordingly.
CMD ["node", "src/server.js"]

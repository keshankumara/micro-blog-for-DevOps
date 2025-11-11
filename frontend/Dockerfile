# Stage 1: build the app
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (including dev deps required for the Vite build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config with our SPA config if provided
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

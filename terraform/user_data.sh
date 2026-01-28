#!/bin/bash
set -e

# Update system
yum update -y

# Install Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Allow ec2-user to run docker without logout
newgrp docker <<EOF
docker --version
EOF

# Create Docker network
docker network create microblog-network || true

# Run MongoDB (optional - for development/testing)
# For production, use MongoDB Atlas instead
docker run -d --restart unless-stopped \
  --name mongodb \
  --network microblog-network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -p 27017:27017 \
  mongo:7.0

# Wait for MongoDB to be ready
sleep 10

# Pull images
docker pull ${dockerhub_username}/microblog-backend:latest
docker pull ${dockerhub_username}/microblog-frontend:latest

# Run backend
docker run -d --restart unless-stopped \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URL='${mongo_url}' \
  -e JWT_SECRET='your-secret-key-change-me' \
  --name backend \
  --network microblog-network \
  ${dockerhub_username}/microblog-backend:latest

# Run frontend
docker run -d --restart unless-stopped \
  -p 80:3000 \
  --name frontend \
  --network microblog-network \
  ${dockerhub_username}/microblog-frontend:latest

echo "✅ Deployment complete!"
docker ps


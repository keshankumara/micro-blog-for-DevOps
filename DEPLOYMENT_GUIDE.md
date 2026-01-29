# 🔐 Secure Deployment Guide

## Overview

This guide shows how to deploy the Microblog application **securely** without exposing secrets in code or GitHub.

---

## 📋 Prerequisites

1. **MongoDB Atlas Cluster**
   - Create at https://www.mongodb.com/cloud/atlas
   - Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/microblog`

2. **Docker Hub Account**
   - Sign up at https://hub.docker.com

3. **Tools Installed**
   - Docker
   - Docker Compose

---

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

**Update `.env`:**

```env
MONGO_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/microblog
JWT_SECRET=your-secure-jwt-secret-key-change-this
NODE_ENV=production
PORT=5000
```

⚠️ **IMPORTANT**: Never commit `.env` to GitHub!

### Step 2: Build Docker Images

```bash
# Build both backend and frontend images
docker-compose build
```

### Step 3: Start the Application

```bash
# Start both backend and frontend containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment

```bash
# Check Docker containers
docker ps

# Check backend logs
docker logs microblog-backend

# Check frontend logs
docker logs microblog-frontend

# Test backend
curl http://54.173.187.235:5000

# Access frontend
open http://54.173.187.235
```

---

## 🔐 Security Best Practices

### ✅ DO:
- [ ] Use `.env` file for all secrets (add to `.gitignore`)
- [ ] Store MongoDB credentials in MongoDB Atlas (not in code)
- [ ] Use environment variables for sensitive config
- [ ] Never commit `.env` file to GitHub
- [ ] Rotate credentials regularly
- [ ] Use strong JWT secrets

### ❌ DON'T:
- [ ] Commit `.env` to GitHub
- [ ] Hardcode MongoDB URI in Dockerfile
- [ ] Log secrets in console output
- [ ] Use default passwords
- [ ] Expose credentials in Docker images

---

## 🔄 CI/CD Integration (Jenkins)

### 1. Add Jenkins Credentials

Go to **Jenkins → Manage Jenkins → Credentials**

Add the following credentials:
- **ID**: `MONGODB_URI`
- **Secret**: Your MongoDB Atlas connection string
- **Type**: Secret text

### 2. Docker Hub Configuration

Add Docker Hub credentials to Jenkins:
- **ID**: `dockerhub-credentials`
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub token

---

## 📁 Project Structure

```
micro-blog-for-DevOps/
├── backend/
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── middleware/            # Auth middleware
│   ├── Dockerfile             # Backend container
│   ├── index.js               # Server entry point
│   └── package.json
├── frontend/
│   ├── src/                   # React components
│   ├── public/                # Static assets
│   ├── Dockerfile             # Frontend container
│   ├── vite.config.js         # Vite configuration
│   └── package.json
├── docker-compose.yml         # Compose configuration
├── .env.example               # Environment template
├── Jenkinsfile                # CI/CD pipeline
├── DEPLOYMENT_GUIDE.md        # This file
└── README.md
```

---

## 🧠 Key Security Principles

> "We use environment variables to inject secrets like MongoDB URI at runtime. The actual values are never stored in code or Docker images. Sensitive configuration is kept in local `.env` files which are excluded from Git. This follows industry best practices for secrets management."

---

## 🔗 References

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Environment Variables in Docker](https://docs.docker.com/compose/environment-variables/)

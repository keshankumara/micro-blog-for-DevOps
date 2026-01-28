# 🔐 Secure Deployment Guide

## Overview

This guide shows how to deploy the Microblog application **securely** without exposing secrets in code or GitHub.

---

## 📋 Prerequisites

1. **MongoDB Atlas Cluster**
   - Create at https://www.mongodb.com/cloud/atlas
   - Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/microblog`

2. **AWS Account**
   - Access key ID and secret key configured in `~/.aws/credentials`

3. **Tools Installed**
   - Terraform
   - Ansible
   - Docker
   - AWS CLI

---

## 🚀 Deployment Steps

### Step 1: Configure Terraform (LOCAL ONLY)

```bash
cd terraform

# Copy example file
cp terraform.tfvars.example terraform.tfvars

# Edit with your actual MongoDB URI
nano terraform.tfvars
```

**Update `terraform.tfvars`:**

```hcl
mongo_url = "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/microblog"
```

⚠️ **IMPORTANT**: Never commit `terraform.tfvars` to GitHub!

### Step 2: Deploy Infrastructure

```bash
terraform init
terraform validate
terraform plan
terraform apply -auto-approve
```

**Output will show:**
```
instance_public_ip = "X.X.X.X"
```

### Step 3: Update Ansible Inventory

Edit `ansible/inventory.ini`:

```ini
[microblog_servers]
X.X.X.X instance_id=i-xxxxx

[microblog_servers:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/microblog-key.pem
```

### Step 4: Deploy with Ansible

```bash
# Option A: Pass MongoDB URI via environment variable
export MONGO_URL="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/microblog"
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml

# Option B: Pass via command line
ansible-playbook \
  -i ansible/inventory.ini \
  ansible/deploy.yml \
  --extra-vars "mongo_url=mongodb+srv://..."
```

### Step 5: Verify Deployment

```bash
# SSH into EC2
ssh -i ~/.ssh/microblog-key.pem ubuntu@X.X.X.X

# Check Docker containers
docker ps
docker logs microblog-backend
docker logs microblog-frontend

# Test backend
curl http://localhost:5000
```

---

## 🔐 Security Best Practices

### ✅ DO:
- [ ] Use `.gitignore` to exclude `terraform.tfvars`
- [ ] Store MongoDB credentials in MongoDB Atlas (not in code)
- [ ] Use environment variables for sensitive config
- [ ] Use AWS SSM Parameter Store for production (future)
- [ ] Rotate credentials regularly

### ❌ DON'T:
- [ ] Commit `terraform.tfvars` to GitHub
- [ ] Hardcode MongoDB URI in Dockerfile
- [ ] Log secrets in CloudWatch / Jenkins
- [ ] Use default passwords

---

## 🔄 CI/CD Integration (Jenkins)

### 1. Add Jenkins Credentials

Go to **Jenkins → Manage Jenkins → Credentials**

Add:
- **ID**: `MONGODB_URI`
- **Secret**: Your MongoDB Atlas connection string
- **Type**: Secret text

### 2. Update Jenkinsfile

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKERHUB_CREDS = credentials('dockerhub-credentials')
    }
    
    stages {
        stage('Build & Push') {
            steps {
                sh '''
                docker build -t keshan01/microblog-backend:latest ./backend
                docker build -t keshan01/microblog-frontend:latest ./frontend
                
                echo $DOCKERHUB_CREDS_PSW | docker login -u $DOCKERHUB_CREDS_USR --password-stdin
                docker push keshan01/microblog-backend:latest
                docker push keshan01/microblog-frontend:latest
                '''
            }
        }
        
        stage('Deploy to AWS') {
            steps {
                withCredentials([string(credentialsId: 'MONGODB_URI', variable: 'MONGO_URI')]) {
                    sh '''
                    cd terraform
                    terraform apply -auto-approve \
                      -var="mongo_url=$MONGO_URI"
                    '''
                }
            }
        }
    }
}
```

---

## 📁 File Structure

```
devops-project/
├── terraform/
│   ├── main.tf                    # Infrastructure code
│   ├── variables.tf               # Variable definitions (mongo_url is sensitive)
│   ├── terraform.tfvars           # ❌ SECRETS - NOT IN GIT
│   ├── terraform.tfvars.example   # ✅ TEMPLATE - IN GIT
│   └── .gitignore                 # Excludes *.tfvars
├── ansible/
│   ├── inventory.ini              # Inventory (update IP)
│   └── deploy.yml                 # Deployment playbook
├── .env.example                   # Environment template
├── Jenkinsfile                    # CI/CD pipeline
└── README.md
```

---

## 🧠 How to Explain in Viva

> "We use environment variables to inject secrets like MongoDB URI at runtime. The actual values are never stored in code or Docker images. Terraform variables marked as `sensitive = true` are kept in local `terraform.tfvars` which is excluded from Git. This follows industry best practices for secrets management."

---

## 🔗 References

- [Terraform Sensitive Variables](https://www.terraform.io/language/state/sensitive-data)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [Ansible Vault](https://docs.ansible.com/ansible/latest/user_guide/vault.html)

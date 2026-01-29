# AWS
aws_region   = "us-east-1"
ami_id       = "ami-0fb0b230890ccd1e6"
key_name     = "devops-key"

# Docker Hub images
backend_image  = "keshan01/microblog-backend:latest"
frontend_image = "keshan01/microblog-frontend:latest"

# App secrets
mongo_url  = "mongodb+srv://devops:devops@cluster0.bynjmyx.mongodb.net/?appName=Cluster0"
jwt_secret = "change-me"

# Ports
backend_port  = 5000
frontend_port = 80

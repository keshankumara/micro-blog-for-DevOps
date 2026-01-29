variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "ami_id" {
  type        = string
  description = "AMI ID (Amazon Linux 2023 recommended)"
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type"
  default     = "t3.micro"
}

variable "key_name" {
  type        = string
  description = "EC2 key pair name for SSH"
}

variable "allowed_ssh_cidrs" {
  type        = list(string)
  description = "CIDR blocks allowed to SSH"
  default     = ["0.0.0.0/0"]
}

variable "backend_image" {
  type        = string
  description = "Docker Hub image for backend (e.g., user/microblog-backend:latest)"
}

variable "frontend_image" {
  type        = string
  description = "Docker Hub image for frontend (e.g., user/microblog-frontend:latest)"
}

variable "mongo_url" {
  type        = string
  description = "MongoDB Atlas URI"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT secret"
  sensitive   = true
}

variable "backend_port" {
  type        = number
  description = "Backend container port"
  default     = 5000
}

variable "frontend_port" {
  type        = number
  description = "Frontend host port"
  default     = 80
}

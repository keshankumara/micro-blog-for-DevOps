terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# -----------------------------
# Default VPC and Subnet
# -----------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# -----------------------------
# Use existing SSH Key in AWS
# -----------------------------
data "aws_key_pair" "devops" {
  key_name = "devops-key-microblog"
}

# -----------------------------
# Use existing Security Group
# -----------------------------
data "aws_security_group" "microblog_sg" {
  name   = "microblog-sg-microblog"
  vpc_id = data.aws_vpc.default.id
}

# -----------------------------
# EC2 Instance
# -----------------------------
resource "aws_instance" "microblog" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [data.aws_security_group.microblog_sg.id]
  key_name                    = data.aws_key_pair.devops.key_name
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    backend_image  = var.backend_image
    frontend_image = var.frontend_image
    mongo_url      = var.mongo_url
    jwt_secret     = var.jwt_secret
    backend_port   = var.backend_port
    frontend_port  = var.frontend_port
  })

  tags = {
    Name = "microblog-server"
  }
}


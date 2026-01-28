terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "microblog" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "microblog-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "microblog" {
  vpc_id = aws_vpc.microblog.id

  tags = {
    Name = "microblog-igw"
  }
}

# Public Subnet
resource "aws_subnet" "microblog" {
  vpc_id                  = aws_vpc.microblog.id
  cidr_block              = var.subnet_cidr
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "microblog-subnet"
  }
}

# Route Table
resource "aws_route_table" "microblog" {
  vpc_id = aws_vpc.microblog.id

  route {
    cidr_block      = "0.0.0.0/0"
    gateway_id      = aws_internet_gateway.microblog.id
  }

  tags = {
    Name = "microblog-rt"
  }
}

# Route Table Association
resource "aws_route_table_association" "microblog" {
  subnet_id      = aws_subnet.microblog.id
  route_table_id = aws_route_table.microblog.id
}

# Security Group
resource "aws_security_group" "microblog" {
  name        = "microblog-sg"
  description = "Security group for microblog"
  vpc_id      = aws_vpc.microblog.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "microblog-sg"
  }
}

# EC2 Instance
resource "aws_instance" "microblog" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = var.key_name

  subnet_id              = aws_subnet.microblog.id
  vpc_security_group_ids = [aws_security_group.microblog.id]

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    dockerhub_username = var.dockerhub_username
    mongo_url          = var.mongo_url
  }))

  tags = {
    Name = "microblog-server"
  }

  depends_on = [aws_internet_gateway.microblog]
}

# Data Sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

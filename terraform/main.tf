provider "aws" {
  region = var.region
}

resource "aws_security_group" "app_sg" {
  name = "app-sg"

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
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami                    = "ami-07fd08aad95a03016" # Ubuntu 22.04 (us-east-1)
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<EOF
#!/bin/bash
apt update -y
apt install docker.io docker-compose -y
systemctl start docker
systemctl enable docker

docker login -u ${var.dockerhub_username}

docker pull ${var.dockerhub_username}/${var.docker_image_backend}
docker pull ${var.dockerhub_username}/${var.docker_image_frontend}

docker run -d -p 3000:3000 ${var.dockerhub_username}/${var.docker_image_backend}
docker run -d -p 80:80 ${var.dockerhub_username}/${var.docker_image_frontend}
EOF

  tags = {
    Name = "docker-app-server"
  }
}

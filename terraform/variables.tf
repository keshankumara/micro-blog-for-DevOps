variable "region" {
  default = "us-east-1"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "key_name" {
  description = "Existing AWS key pair name"
}

variable "dockerhub_username" {
  description = "Docker Hub username"
}

variable "docker_image_backend" {
  description = "Backend Docker image name"
}

variable "docker_image_frontend" {
  description = "Frontend Docker image name"
}

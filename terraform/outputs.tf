output "instance_public_ip" {
  value       = aws_instance.microblog.public_ip
  description = "Public IP address of the EC2 instance"
}

output "frontend_url" {
  value       = "http://${aws_instance.microblog.public_ip}"
  description = "Frontend URL"
}

output "backend_url" {
  value       = "http://${aws_instance.microblog.public_ip}:${var.backend_port}"
  description = "Backend API URL"
}

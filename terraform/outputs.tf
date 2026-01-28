output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.microblog.id
}

output "instance_public_ip" {
  description = "EC2 public IP"
  value       = aws_instance.microblog.public_ip
}

output "instance_public_dns" {
  description = "EC2 public DNS"
  value       = aws_instance.microblog.public_dns
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_instance.microblog.public_ip}"
}

output "backend_url" {
  description = "Backend URL"
  value       = "http://${aws_instance.microblog.public_ip}:5000"
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.microblog.id
}

output "security_group_id" {
  description = "Security Group ID"
  value       = aws_security_group.microblog.id
}

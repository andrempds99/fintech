output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.app_distribution.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution Domain Name"
  value       = aws_cloudfront_distribution.app_distribution.domain_name
}

output "cloudfront_url" {
  description = "CloudFront Distribution URL"
  value       = "https://${aws_cloudfront_distribution.app_distribution.domain_name}"
}

output "cloudfront_arn" {
  description = "CloudFront Distribution ARN"
  value       = aws_cloudfront_distribution.app_distribution.arn
}

output "ssl_certificate_arn" {
  description = "SSL Certificate ARN (only if custom domain is used)"
  value       = var.domain_name != "" ? aws_acm_certificate.ssl_cert[0].arn : null
}

output "route53_record_name" {
  description = "Route53 Record Name (only if custom domain is used)"
  value       = var.domain_name != "" && var.route53_zone_id != "" ? aws_route53_record.cloudfront_alias[0].name : null
}


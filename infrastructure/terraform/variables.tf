variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "fintech"
}

variable "domain_name" {
  description = "Primary domain name for the application (optional - leave empty for free CloudFront domain). For free tier usage, leave empty to use CloudFront's default domain (d1234567890.cloudfront.net) with free SSL certificate."
  type        = string
  default     = ""
  # Example: "app.example.com" or "" for free CloudFront domain
  # FREE TIER: Leave empty to avoid Route53 query costs and use CloudFront's free default domain
}

variable "additional_domains" {
  description = "Additional domain names (SANs) for SSL certificate"
  type        = list(string)
  default     = []
}

variable "origin_domain" {
  description = "Origin domain (EC2 instance IP or domain)"
  type        = string
  # Example: "15.237.181.208" or "api.example.com"
}

variable "ec2_ip_address" {
  description = "EC2 instance IP address (if using existing instance)"
  type        = string
  default     = ""
}

variable "use_existing_instance" {
  description = "Whether to use existing EC2 instance"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID (optional - only needed if using custom domain). For free tier usage, leave empty to avoid Route53 query costs."
  type        = string
  default     = ""
  # FREE TIER: Leave empty - Route53 queries cost $0.40 per million queries after free tier
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_200 (US/EU only) is recommended for free tier optimization as it's cheaper than PriceClass_100 (all locations)."
  type        = string
  default     = "PriceClass_200" # North America and Europe (cheaper, recommended for free tier)
  
  validation {
    condition = contains([
      "PriceClass_100", # All edge locations (most expensive)
      "PriceClass_200", # North America and Europe (cheaper, recommended for free tier)
      "PriceClass_All"  # All edge locations (same as 100)
    ], var.price_class)
    error_message = "Price class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "waf_web_acl_id" {
  description = "WAF Web ACL ID to associate with CloudFront (optional)"
  type        = string
  default     = ""
}


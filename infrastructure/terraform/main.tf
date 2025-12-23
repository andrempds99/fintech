terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Using local backend (state stored in terraform.tfstate file)
  # For production/team use, uncomment and configure S3 backend:
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "fintech/cloudfront/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "FinTech Application"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Locals for conditional SSL certificate configuration
# FREE TIER: When domain_name and route53_zone_id are empty, this evaluates to false,
# causing all Route53 and ACM resources to be skipped, using only CloudFront's free default domain
locals {
  use_custom_domain = var.domain_name != "" && var.route53_zone_id != ""
}

# Data source for existing EC2 instance (or use load balancer)
data "aws_instance" "app_server" {
  count = var.use_existing_instance ? 1 : 0
  
  filter {
    name   = "ip-address"
    values = [var.ec2_ip_address]
  }
}

# Data sources for AWS managed CloudFront cache policies
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

# Data source for AWS managed CloudFront origin request policy
data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

# SSL Certificate (only if domain_name is provided)
# FREE TIER: This resource is NOT created when domain_name is empty.
# CloudFront will use its default SSL certificate (free) instead.
resource "aws_acm_certificate" "ssl_cert" {
  count = var.domain_name != "" ? 1 : 0
  
  provider = aws.us_east_1 # CloudFront requires certs in us-east-1
  
  domain_name       = var.domain_name
  validation_method = "DNS"
  
  subject_alternative_names = var.additional_domains
  
  lifecycle {
    create_before_destroy = true
  }
  
  tags = {
    Name = "${var.project_name}-ssl-cert"
  }
}

# Certificate validation (only if domain_name is provided)
# FREE TIER: This resource is NOT created when domain_name is empty.
# No certificate validation needed for CloudFront's default certificate.
resource "aws_acm_certificate_validation" "ssl_cert_validation" {
  count = var.domain_name != "" ? 1 : 0
  
  provider = aws.us_east_1
  
  certificate_arn = aws_acm_certificate.ssl_cert[0].arn
  
  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
  ]
  
  timeouts {
    create = "5m"
  }
}

# Route53 records for certificate validation (only if domain_name is provided)
# FREE TIER: This resource is NOT created when domain_name or route53_zone_id is empty.
# Route53 queries cost $0.40 per million after free tier, so skipping this avoids costs.
resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" && var.route53_zone_id != "" ? {
    for dvo in aws_acm_certificate.ssl_cert[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}
  
  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = var.route53_zone_id
}

# CloudFront Distribution
# Note: Origin Access Control (OAC) is only for S3 origins, not custom origins like EC2.
# For EC2 origins, we use custom_origin_config without OAC.
resource "aws_cloudfront_distribution" "app_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "${var.project_name} CloudFront Distribution"
  default_root_object = "index.html"
  price_class         = var.price_class
  
  # Aliases only if domain_name is provided
  aliases = var.domain_name != "" ? concat([var.domain_name], var.additional_domains) : []
  
  # SSL Configuration
  # FREE TIER: When use_custom_domain is false (domain_name empty), CloudFront uses its
  # default SSL certificate (cloudfront_default_certificate = true), which is always free.
  # No ACM certificate needed, avoiding Route53 validation costs.
  viewer_certificate {
    acm_certificate_arn      = local.use_custom_domain ? aws_acm_certificate_validation.ssl_cert_validation[0].certificate_arn : null
    ssl_support_method       = local.use_custom_domain ? "sni-only" : null
    minimum_protocol_version = local.use_custom_domain ? "TLSv1.2_2021" : null
    cloudfront_default_certificate = local.use_custom_domain ? null : true
  }
  
  # Custom Error Responses
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  # Origin Configuration
  # FREE TIER: Custom origin (EC2) doesn't require Origin Access Control (OAC).
  # OAC is only for S3 origins. For EC2, we use custom_origin_config.
  origin {
    domain_name = var.origin_domain
    origin_id   = "${var.project_name}-ec2-origin"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # CloudFront will handle HTTPS
      origin_ssl_protocols   = ["TLSv1.2"]
    }
    
    custom_header {
      name  = "X-Forwarded-Proto"
      value = "https"
    }
    
    custom_header {
      name  = "X-CloudFront-Origin"
      value = "true"
    }
  }
  
  # Default Cache Behavior
  default_cache_behavior {
    allowed_methods         = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "${var.project_name}-ec2-origin"
    compress                = true
    cache_policy_id         = data.aws_cloudfront_cache_policy.caching_optimized.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    viewer_protocol_policy  = "redirect-to-https"
  }
  
  # API Cache Behavior (no caching for API calls)
  ordered_cache_behavior {
    path_pattern            = "/api/*"
    target_origin_id        = "${var.project_name}-ec2-origin"
    allowed_methods         = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods          = ["GET", "HEAD"]
    compress                = true
    cache_policy_id         = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    viewer_protocol_policy   = "redirect-to-https"
  }
  
  # Restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  # Web Application Firewall (WAF) Association
  web_acl_id = var.waf_web_acl_id != "" ? var.waf_web_acl_id : null
  
  tags = {
    Name = "${var.project_name}-cloudfront"
  }
}

# Route53 Record for CloudFront (only if domain_name and route53_zone_id are provided)
# FREE TIER: This resource is NOT created when domain_name or route53_zone_id is empty.
# Users will access CloudFront directly via its default domain (d1234567890.cloudfront.net),
# avoiding Route53 query costs ($0.40 per million queries after free tier).
resource "aws_route53_record" "cloudfront_alias" {
  count = var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0
  
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"
  
  alias {
    name                   = aws_cloudfront_distribution.app_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.app_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 Record for IPv6 (only if domain_name and route53_zone_id are provided)
# FREE TIER: This resource is NOT created when domain_name or route53_zone_id is empty.
# IPv6 support is still available via CloudFront's default domain without Route53.
resource "aws_route53_record" "cloudfront_alias_ipv6" {
  count = var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0
  
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "AAAA"
  
  alias {
    name                   = aws_cloudfront_distribution.app_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.app_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}



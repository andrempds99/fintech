# Provider for us-east-1 (required for CloudFront SSL certificates)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  
  default_tags {
    tags = {
      Project     = "FinTech Application"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}


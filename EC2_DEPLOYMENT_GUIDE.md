# EC2 Deployment Guide for FinTech Application (Free Tier Optimized)

This comprehensive guide will walk you through deploying the fintech application on AWS EC2 with PostgreSQL running on an attached EBS volume. **This guide is optimized for AWS Free Tier to minimize costs.**

## ⚠️ Important: Free Tier Information

This deployment uses **AWS Free Tier resources** which are available for **12 months** from account creation:
- ✅ **EC2**: t2.micro or t3.micro instances (750 hours/month)
- ✅ **EBS**: Up to 30GB of storage (gp2 or gp3)
- ✅ **Data Transfer**: 15GB outbound per month
- ✅ **Domain**: Optional (can use IP address)
- ✅ **SSL**: Free via Let's Encrypt

**After 12 months**, you'll incur standard AWS charges. Monitor your usage in the AWS Billing Dashboard.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [EC2 Instance Setup](#ec2-instance-setup)
3. [EBS Volume Setup](#ebs-volume-setup)
4. [PostgreSQL Installation & Configuration](#postgresql-installation--configuration)
5. [Application Setup](#application-setup)
6. [Database Migration & Seeding](#database-migration--seeding)
7. [nginx Configuration](#nginx-configuration)
8. [Process Management & Auto-start](#process-management--auto-start)
9. [Security Hardening](#security-hardening)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

### AWS Account Requirements
- Active AWS account with appropriate permissions
- Access to EC2, EBS, and VPC services
- Basic knowledge of AWS console and SSH
- **Important**: This guide is optimized for AWS Free Tier (first 12 months for new accounts)

### AWS Free Tier Limitations
- **EC2**: 750 hours/month of t2.micro or t3.micro instances
- **EBS**: 30GB of General Purpose (gp2 or gp3) storage
- **Data Transfer**: 15GB outbound data transfer per month
- **Note**: Free tier is valid for 12 months from account creation. After that, you'll incur charges.

### EC2 Instance Specifications (Free Tier Optimized)
- **Instance Type**: **t2.micro or t3.micro** (free tier eligible)
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Storage**: 8GB root volume (included in free tier)
- **RAM**: 1GB (t2.micro/t3.micro limitation)
- **CPU**: 1-2 vCPUs (burstable performance)
- **Note**: These instances have limited resources. For production workloads, consider upgrading after free tier expires.

### EBS Volume Specifications (Free Tier Optimized)
- **Size**: **20GB maximum** (to stay within 30GB free tier limit including root volume)
- **Type**: gp3 (recommended) or gp2 (both included in free tier)
- **IOPS**: 3000 (gp3) or baseline IOPS (gp2) - sufficient for small applications
- **Purpose**: Dedicated volume for PostgreSQL data directory
- **Note**: Total EBS storage (root + data volume) must not exceed 30GB to remain free

### Domain Name (Optional but Recommended)
- Registered domain name for SSL certificate
- DNS access to create A records pointing to EC2 instance
- If no domain, you can use EC2 public IP (SSL setup will be skipped)

### Security Group Requirements
Configure your EC2 security group to allow:
- **Port 22 (SSH)**: From your IP address only
- **Port 80 (HTTP)**: From anywhere (0.0.0.0/0) - for Let's Encrypt
- **Port 443 (HTTPS)**: From anywhere (0.0.0.0/0) - for secure access
- **Port 3001**: Optional - only if you want direct backend access (not recommended for production)

### Network Requirements
- VPC with internet gateway (free)
- Public subnet for EC2 instance (free)
- **Elastic IP**: Optional - Free when attached to running instance, but **charges apply if instance is stopped**. For free tier, you can use the auto-assigned public IP instead.

---

## EC2 Instance Setup

### Step 1: Launch EC2 Instance

1. **Navigate to EC2 Console**
   - Go to AWS Console → EC2 → Instances
   - Click "Launch Instance"

2. **Configure Instance**
   - **Name**: `fintech-app-production` (or your preferred name)
   - **AMI**: Ubuntu Server 22.04 LTS (64-bit x86)
   - **Instance Type**: **t2.micro or t3.micro** (free tier eligible)
   - **Key Pair**: Select existing or create new SSH key pair
   - **Network Settings**: 
     - Select your VPC
     - Enable "Auto-assign public IP" (this gives you a public IP without Elastic IP costs)
     - **Security Group**: 
       - **Option A: Select Existing Security Group**
         - If you have a security group with ports 22, 80, and 443 already configured, select it from the dropdown
       - **Option B: Create New Security Group**
         - Click "Create security group"
         - **Security group name**: `fintech-app-sg` (or your preferred name)
         - **Description**: "Security group for FinTech application"
         - **Inbound rules** (add these rules):
           1. **SSH (Port 22)**:
              - Type: SSH
              - Protocol: TCP
              - Port range: 22
              - Source type: My IP (recommended) or Custom (0.0.0.0/0 for any IP - less secure)
              - Description: "SSH access from my IP"
           2. **HTTP (Port 80)**:
              - Type: HTTP
              - Protocol: TCP
              - Port range: 80
              - Source type: Anywhere-IPv4 (0.0.0.0/0)
              - Description: "HTTP access for Let's Encrypt and web traffic"
           3. **HTTPS (Port 443)**:
              - Type: HTTPS
              - Protocol: TCP
              - Port range: 443
              - Source type: Anywhere-IPv4 (0.0.0.0/0)
              - Description: "HTTPS secure web access"
         - **Outbound rules**: Leave default (all traffic allowed)
         - Click "Add security group"
   - **Storage**: 8GB root volume (gp3 or gp2 - both free tier eligible)

3. **Launch Instance**
   - Review settings and click "Launch Instance"
   - Wait for instance to be in "Running" state

### Step 2: Allocate Elastic IP (Optional - Not Required for Free Tier)

**Note**: Elastic IPs are free when attached to a running instance, but you'll be charged if the instance is stopped. For free tier deployments, you can skip this step and use the auto-assigned public IP. The IP will change if you stop/start the instance, but this is acceptable for development/testing.

**If you want a static IP** (optional):
1. Go to EC2 → Elastic IPs
2. Click "Allocate Elastic IP address"
3. Select "Allocate"
4. Select the Elastic IP → Actions → Associate Elastic IP address
5. Select your EC2 instance and associate
6. **Important**: Always keep your instance running to avoid charges for unattached Elastic IPs

### Step 3: Connect to Instance

**Important**: Run this command on your **local computer** (not on the EC2 instance). You'll need:
- The SSH key file (`.pem` file) you selected/created when launching the instance
- The public IP address of your EC2 instance (found in EC2 Console → Instances → select your instance → see "Public IPv4 address")

**On Windows (PowerShell or Command Prompt)**:
```powershell
# Replace with your key file path and instance IP
# Note: Use quotes around the path if it contains spaces
ssh -i "C:\path\to\your-key.pem" ubuntu@YOUR_EC2_IP_ADDRESS
```

**On macOS/Linux**:
```bash
# Replace with your key file path and instance IP
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP_ADDRESS
```

**Example**:
```powershell
# Windows example (PowerShell)
ssh -i "C:\Users\andre\Downloads\fintech-key.pem" ubuntu@13.36.170.2
```

```bash
# macOS/Linux example
ssh -i ~/Downloads/my-key.pem ubuntu@54.123.45.67
```

**Note**: 
- If you get a permission error on macOS/Linux, you may need to set proper permissions: `chmod 400 /path/to/your-key.pem`
- On Windows, if using PowerShell, you may need to use the full path to the key file
- After connecting, you'll be in the EC2 instance's terminal and can proceed with the next steps

### Step 4: Update System Packages

```bash
# Update package list
sudo apt update

# Upgrade system packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

---

## EBS Volume Setup

### Step 1: Create EBS Volume

1. **Via AWS Console**
   - Go to EC2 → Volumes
   - Click "Create Volume"
   - **Size**: **20GB** (maximum to stay within 30GB free tier limit with 8GB root volume)
   - **Volume Type**: gp3 (recommended) or gp2 (both free tier eligible)
   - **IOPS**: 3000 (for gp3) or baseline (for gp2)
   - **Availability Zone**: **MUST match your EC2 instance's AZ**
   - Click "Create Volume"
   - **Note**: Total storage (8GB root + 20GB data = 28GB) stays within 30GB free tier limit

2. **Note the Volume ID** (e.g., `vol-0123456789abcdef0`)

### Step 2: Attach Volume to EC2 Instance

1. **Via AWS Console**
   - Select the volume → Actions → Attach Volume
   - Select your EC2 instance
   - Device name: `/dev/sdf` (or `/dev/xvdf` for older instances)
   - Click "Attach"

2. **Verify Attachment**
   ```bash
   # Check if volume is attached
   lsblk
   
   # You should see a device like /dev/nvme1n1 or /dev/xvdf
   ```

### Step 3: Format and Mount Volume

```bash
# Identify the device (usually /dev/nvme1n1 or /dev/xvdf)
sudo lsblk

# Format the volume (WARNING: This erases all data!)
# Replace /dev/nvme1n1 with your actual device
sudo mkfs -t ext4 /dev/nvme1n1

# Create mount point
sudo mkdir -p /mnt/postgres-data

# Mount the volume
sudo mount /dev/nvme1n1 /mnt/postgres-data

# Verify mount
df -h /mnt/postgres-data
```

### Step 4: Configure Persistent Mounting

```bash
# Get the UUID of the volume
sudo blkid /dev/nvme1n1

# Edit fstab (replace UUID with actual UUID from blkid output)
sudo nano /etc/fstab

# Add this line at the end of the file (replace YOUR_UUID with your actual UUID from blkid output):
# IMPORTANT: Do NOT include quotes around the UUID value
UUID=YOUR_UUID /mnt/postgres-data ext4 defaults,nofail 0 2

# Example format (replace with your actual UUID):
# UUID=f15081c9-59f6-4a96-ad76-f17f04fb3021 /mnt/postgres-data ext4 defaults,nofail 0 2

# Test fstab configuration
sudo mount -a

# Verify it's mounted
df -h /mnt/postgres-data
```

### Step 5: Set Up PostgreSQL Data Directory

```bash
# Create PostgreSQL data directory on mounted volume
sudo mkdir -p /mnt/postgres-data/postgresql

# Set ownership (postgres user will be created later)
# For now, set it to root, we'll change it after PostgreSQL installation
sudo chown root:root /mnt/postgres-data/postgresql
sudo chmod 700 /mnt/postgres-data/postgresql
```

---

## PostgreSQL Installation & Configuration

### Step 1: Install PostgreSQL

**For Ubuntu 24.04**: PostgreSQL 15 is not in the default repositories. You need to add the official PostgreSQL APT repository.

```bash
# Add PostgreSQL APT repository
sudo apt install -y wget ca-certificates gnupg lsb-release

# Add PostgreSQL GPG key (modern method)
sudo mkdir -p /etc/apt/keyrings
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg

# Add PostgreSQL repository (for Ubuntu 24.04)
echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list

# Update package list
sudo apt update

# Install PostgreSQL 15
sudo apt install -y postgresql-15 postgresql-contrib-15

# Check PostgreSQL version
sudo -u postgres psql --version
```

**Alternative**: If you prefer to use PostgreSQL 16 (available in Ubuntu 24.04 default repos), you can use:
```bash
# Install PostgreSQL 16 from default repos (no repository setup needed)
sudo apt install -y postgresql postgresql-contrib

# Note: If using PostgreSQL 16, replace all references to "15" with "16" in the following steps
```

### Step 2: Stop PostgreSQL Service

```bash
# Stop PostgreSQL to move data directory
sudo systemctl stop postgresql
```

### Step 3: Move PostgreSQL Data Directory to EBS Volume

```bash
# Backup existing data (if any)
sudo mv /var/lib/postgresql/15/main /var/lib/postgresql/15/main.backup

# Create new data directory on EBS volume
sudo mkdir -p /mnt/postgres-data/postgresql/15/main

# Set ownership to postgres user (recursively for all parent directories)
sudo chown -R postgres:postgres /mnt/postgres-data/postgresql
sudo chmod 700 /mnt/postgres-data/postgresql/15/main

# Ensure parent directories are accessible (postgres needs to traverse them)
sudo chmod 755 /mnt/postgres-data
sudo chmod 755 /mnt/postgres-data/postgresql
sudo chmod 755 /mnt/postgres-data/postgresql/15

# Copy existing data (if any) or initialize new database
# Option A: If you have existing data
# sudo cp -R /var/lib/postgresql/15/main.backup/* /mnt/postgres-data/postgresql/15/main/
# sudo chown -R postgres:postgres /mnt/postgres-data/postgresql/15/main

# Option B: Initialize new database (recommended for fresh install)
sudo -u postgres /usr/lib/postgresql/15/bin/initdb -D /mnt/postgres-data/postgresql/15/main
```

### Step 4: Update PostgreSQL Configuration

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Update data_directory (uncomment and set):
# data_directory = '/mnt/postgres-data/postgresql/15/main'

# Update listen_addresses (uncomment and set):
# listen_addresses = 'localhost'

# Update max_connections (optimized for free tier - limited RAM):
# max_connections = 20  # Reduced for t2.micro/t3.micro (1GB RAM)

# Update shared_buffers (optimized for free tier):
# shared_buffers = 256MB  # 25% of 1GB RAM

# Update effective_cache_size:
# effective_cache_size = 512MB  # 50% of 1GB RAM

# Save and exit (Ctrl+X, Y, Enter)
```

**Note**: These settings are optimized for free tier instances with 1GB RAM. Adjust if you upgrade to larger instances.

### Step 5: Configure pg_hba.conf

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Ensure these lines exist (for local connections):
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            scram-sha-256
# host    all             all             ::1/128                   scram-sha-256

# Save and exit
```

### Step 6: Start PostgreSQL Service

```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql

# Verify PostgreSQL is running
sudo -u postgres psql -c "SELECT version();"
```

### Step 7: Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE fintech_db;
CREATE USER fintech_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech_user;
ALTER USER fintech_user CREATEDB;
\q
```

**Important**: Replace `your_secure_password_here` with a strong password. Save this password securely.

### Step 8: Configure Firewall

```bash
# PostgreSQL should only accept local connections, but verify firewall
sudo ufw status

# PostgreSQL doesn't need external access, so no firewall rule needed
# If you need to allow from specific IPs (not recommended):
# sudo ufw allow from YOUR_IP_ADDRESS to any port 5432
```

---

## Application Setup

### Step 1: Install Docker and Docker Compose

```bash
# Install prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Log out and log back in for group changes to take effect
# Or run: newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

### Step 2: Clone/Upload Project Files

**Option A: Using Git (if repository is on GitHub/GitLab)**

```bash
# Navigate to home directory
cd ~

# Clone repository (replace with your repository URL)
git clone https://github.com/yourusername/fintech.git

# Navigate to project
cd fintech
```

**Option B: Upload Files via SCP**

```bash
# From your local machine, run:
# scp -i /path/to/your-key.pem -r /path/to/fintech ubuntu@YOUR_EC2_IP:~/
```

**Option C: Using AWS CodeCommit or other methods**

```bash
# Create project directory
mkdir -p ~/fintech
cd ~/fintech
# Upload files using your preferred method
```

### Step 3: Create Production Docker Compose File

```bash
# Navigate to backend directory
cd ~/fintech/backend

# Create production docker-compose file
nano docker-compose.prod.yml
```

Add the following content to `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fintech_backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=host.docker.internal
      - DB_PORT=5432
      - DB_NAME=fintech_db
      - DB_USER=fintech_user
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=7d
      - PORT=3001
      - FRONTEND_URL=${FRONTEND_URL}
      - CORS_ORIGIN=${CORS_ORIGIN}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - frontend
    networks:
      - fintech-network

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    container_name: fintech_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=${VITE_API_URL}
    volumes:
      - ../frontend/build:/app/build
    networks:
      - fintech-network

networks:
  fintech-network:
    driver: bridge
```

### Step 4: Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config (optional, for SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx config** (`frontend/nginx.conf`):

```nginx
server {
    listen 3000;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Configure Environment Variables

**Backend `.env` file** (`backend/.env`):

```bash
cd ~/fintech/backend
nano .env
```

```env
NODE_ENV=production
DB_HOST=host.docker.internal
DB_PORT=5432
DB_NAME=fintech_db
DB_USER=fintech_user
DB_PASSWORD=your_secure_password_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

**Frontend `.env` file** (`frontend/.env`):

```bash
cd ~/fintech/frontend
nano .env
```

```env
VITE_API_URL=https://yourdomain.com/api
```

**Important**: 
- Replace `your_secure_password_here` with the PostgreSQL password you created
- Replace `your-super-secret-jwt-key-change-this-in-production-min-32-chars` with a strong random string (minimum 32 characters)
- Replace `yourdomain.com` with your actual domain name **OR** use your EC2 public IP address (e.g., `http://54.123.45.67`)
- If using IP address, use `http://` instead of `https://` (SSL requires a domain)

### Step 6: Update Docker Compose for Host Network Access

Since PostgreSQL is running on the host, we need to allow Docker containers to access it:

```bash
# Edit docker-compose.prod.yml
cd ~/fintech/backend
nano docker-compose.prod.yml
```

Update the backend service to use `host.docker.internal` or add `extra_hosts`:

```yaml
services:
  backend:
    # ... other config ...
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Alternatively, use `network_mode: "host"` for backend (simpler but less secure):

```yaml
services:
  backend:
    # ... other config ...
    network_mode: "host"
```

### Step 7: Build and Start Containers

```bash
# Navigate to backend directory
cd ~/fintech/backend

# Build images (this may take a while on free tier instances)
docker compose -f docker-compose.prod.yml build

# Start containers
docker compose -f docker-compose.prod.yml up -d

# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Note: On free tier instances (t2.micro/t3.micro), builds may be slower due to limited CPU
# Be patient during the build process
```

---

## Database Migration & Seeding

### Step 1: Run Database Migrations

```bash
# Navigate to backend directory
cd ~/fintech/backend

# Option A: Run migrations from inside the container
docker compose -f docker-compose.prod.yml exec backend npm run migrate

# Option B: Run migrations directly on host (if Node.js is installed)
# First, install dependencies on host
npm install
# Then run migrations
npm run migrate
```

### Step 2: Seed Database

```bash
# Seed database with initial data
docker compose -f docker-compose.prod.yml exec backend npm run seed

# Or from host:
npm run seed
```

### Step 3: Verify Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql -d fintech_db

# Check tables
\dt

# Check user
\du

# Exit
\q
```

---

## nginx Configuration

### Step 1: Install nginx

```bash
# Install nginx
sudo apt install -y nginx

# Check nginx version
nginx -v
```

### Step 2: Configure nginx as Reverse Proxy

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/fintech
```

Add the following configuration:

```nginx
# Upstream backend
upstream backend {
    server localhost:3001;
}

# Upstream frontend
upstream frontend {
    server localhost:3000;
}

# HTTP server (redirects to HTTPS)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # For Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (if needed)
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Important**: Replace `yourdomain.com` with your actual domain name.

### Step 3: Enable Site Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/fintech /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### Step 4: Set Up SSL with Let's Encrypt (Optional - Requires Domain)

**Note**: SSL certificates require a domain name. If you don't have a domain, skip this step and use HTTP only (update nginx config below).

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)

# Test automatic renewal
sudo certbot renew --dry-run
```

**If you don't have a domain name**, update the nginx configuration to use HTTP only:

```nginx
# Simplified HTTP-only configuration (no SSL)
server {
    listen 80;
    server_name _;  # Accepts any hostname

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then update your environment variables to use `http://` instead of `https://`.

### Step 5: Configure Auto-renewal for SSL

```bash
# Certbot automatically sets up a cron job, but verify:
sudo systemctl status certbot.timer

# Or check cron job
sudo crontab -l
```

---

## Process Management & Auto-start

### Step 1: Configure Docker Compose Auto-start

```bash
# Create systemd service for Docker Compose
sudo nano /etc/systemd/system/fintech-app.service
```

Add the following:

```ini
[Unit]
Description=FinTech Application Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/fintech/backend
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable fintech-app.service

# Start service
sudo systemctl start fintech-app.service

# Check status
sudo systemctl status fintech-app.service
```

### Step 2: Verify PostgreSQL Auto-start

```bash
# PostgreSQL should already be enabled, but verify:
sudo systemctl is-enabled postgresql

# If not enabled:
sudo systemctl enable postgresql
```

### Step 3: Configure Log Rotation

```bash
# Create logrotate configuration for application logs
sudo nano /etc/logrotate.d/fintech
```

Add:

```
/home/ubuntu/fintech/backend/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        docker compose -f /home/ubuntu/fintech/backend/docker-compose.prod.yml restart backend || true
    endscript
}
```

### Step 4: Set Up Health Checks (Optional)

Create a simple health check script:

```bash
# Create health check script
nano ~/health-check.sh
```

```bash
#!/bin/bash

# Check PostgreSQL
if ! sudo systemctl is-active --quiet postgresql; then
    echo "PostgreSQL is down!"
    exit 1
fi

# Check Docker containers
if ! docker ps | grep -q fintech_backend; then
    echo "Backend container is down!"
    exit 1
fi

if ! docker ps | grep -q fintech_frontend; then
    echo "Frontend container is down!"
    exit 1
fi

# Check nginx
if ! sudo systemctl is-active --quiet nginx; then
    echo "Nginx is down!"
    exit 1
fi

echo "All services are running"
exit 0
```

```bash
# Make executable
chmod +x ~/health-check.sh

# Test
~/health-check.sh
```

---

## Security Hardening

### Step 1: Configure Firewall (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status verbose

# Deny direct access to backend port (if not using nginx)
sudo ufw deny 3001/tcp
```

### Step 2: Secure SSH Access

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

Recommended settings:

```
# Disable root login
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no
PubkeyAuthentication yes

# Change default port (optional, but recommended)
# Port 2222

# Limit login attempts
MaxAuthTries 3

# Disable empty passwords
PermitEmptyPasswords no
```

```bash
# Restart SSH service
sudo systemctl restart sshd

# Test SSH connection before closing current session!
# Open a new terminal and test
```

### Step 3: Database Security

```bash
# Ensure PostgreSQL only listens on localhost
sudo nano /etc/postgresql/15/main/postgresql.conf

# Verify: listen_addresses = 'localhost'

# Restrict database access in pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Ensure only local connections are allowed
# Remove or comment out any lines allowing external connections
```

### Step 4: Environment Variable Security

```bash
# Set proper permissions on .env files
chmod 600 ~/fintech/backend/.env
chmod 600 ~/fintech/frontend/.env

# Ensure .env files are not in version control
# Add to .gitignore if not already there
```

### Step 5: Regular Backup Strategy

**Create Backup Script** (`~/backup-db.sh`):

```bash
#!/bin/bash

BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/fintech_db_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
sudo -u postgres pg_dump fintech_db > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Keep only last 7 days of backups (to save disk space on free tier)
find $BACKUP_DIR -name "fintech_db_*.sql.gz" -mtime +7 -delete

# Optional: Upload to S3 (requires S3 bucket - not free tier)
# aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/database-backups/
# Note: S3 is not included in free tier, so this will incur charges
```

```bash
# Make executable
chmod +x ~/backup-db.sh

# Test backup
~/backup-db.sh

# Add to crontab for daily backups at 2 AM
crontab -e

# Add this line:
# 0 2 * * * /home/ubuntu/backup-db.sh
```

### Step 6: System Updates

```bash
# Set up automatic security updates
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Enable automatic updates
sudo systemctl enable unattended-upgrades
sudo systemctl start unattended-upgrades
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Cannot Connect to Database

**Symptoms**: Backend logs show "Database connection error"

**Solutions**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Verify database exists
sudo -u postgres psql -l

# Test connection
sudo -u postgres psql -d fintech_db -U fintech_user

# Check pg_hba.conf allows connections
sudo cat /etc/postgresql/15/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### Issue 2: Docker Containers Not Starting

**Symptoms**: Containers exit immediately or fail to start

**Solutions**:
```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs

# Check specific service logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker

# Rebuild containers
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

#### Issue 3: nginx 502 Bad Gateway

**Symptoms**: nginx returns 502 error

**Solutions**:
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify backend is running
docker ps | grep backend
curl http://localhost:3001/api/health

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

#### Issue 4: EBS Volume Not Mounting

**Symptoms**: Volume not available after reboot

**Solutions**:
```bash
# Check if volume is attached
lsblk

# Check fstab
cat /etc/fstab

# Manually mount
sudo mount /dev/nvme1n1 /mnt/postgres-data

# Check mount point permissions
ls -la /mnt/postgres-data

# Verify UUID in fstab matches actual UUID
sudo blkid /dev/nvme1n1
```

#### Issue 5: SSL Certificate Issues

**Symptoms**: SSL certificate errors or renewal failures

**Solutions**:
```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Manually renew
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t

# View SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Log File Locations

- **PostgreSQL logs**: `/var/log/postgresql/postgresql-15-main.log`
- **nginx access logs**: `/var/log/nginx/access.log`
- **nginx error logs**: `/var/log/nginx/error.log`
- **Application logs**: `~/fintech/backend/logs/`
- **Docker logs**: `docker compose -f docker-compose.prod.yml logs`
- **System logs**: `/var/log/syslog`

### Service Status Checks

```bash
# Check all services status
sudo systemctl status postgresql
sudo systemctl status nginx
sudo systemctl status fintech-app
sudo systemctl status docker

# Check Docker containers
docker ps -a

# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## Maintenance & Updates

### Application Update Procedure

```bash
# 1. Backup database
~/backup-db.sh

# 2. Pull latest code (if using Git)
cd ~/fintech
git pull origin main

# 3. Rebuild Docker images
cd ~/fintech/backend
docker compose -f docker-compose.prod.yml build --no-cache

# 4. Stop containers
docker compose -f docker-compose.prod.yml down

# 5. Start containers
docker compose -f docker-compose.prod.yml up -d

# 6. Run migrations (if schema changed)
docker compose -f docker-compose.prod.yml exec backend npm run migrate

# 7. Verify services
docker compose -f docker-compose.prod.yml ps
curl https://yourdomain.com/api/health
```

### Database Backup and Restore

**Backup**:
```bash
# Manual backup
sudo -u postgres pg_dump fintech_db > backup_$(date +%Y%m%d).sql

# Compressed backup
sudo -u postgres pg_dump fintech_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Restore**:
```bash
# Stop application
docker compose -f docker-compose.prod.yml down

# Restore database
sudo -u postgres psql fintech_db < backup_YYYYMMDD.sql

# Or from compressed backup
gunzip < backup_YYYYMMDD.sql.gz | sudo -u postgres psql fintech_db

# Start application
docker compose -f docker-compose.prod.yml up -d
```

### SSL Certificate Renewal

```bash
# Certbot automatically renews certificates, but you can manually renew:
sudo certbot renew

# After renewal, reload nginx
sudo systemctl reload nginx

# Verify renewal is scheduled
sudo systemctl status certbot.timer
```

### System Updates

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Reboot if kernel was updated
sudo reboot

# After reboot, verify all services
sudo systemctl status postgresql
sudo systemctl status nginx
sudo systemctl status fintech-app
docker ps
```

### Monitoring Recommendations

1. **Set up CloudWatch** (AWS native monitoring - basic monitoring is free, detailed monitoring incurs charges)
2. **Install monitoring tools** like Prometheus + Grafana (free, but uses instance resources)
3. **Set up alerts** for disk space, memory, and service failures (free with basic CloudWatch)
4. **Regular log review** to identify issues early (free)
5. **Database performance monitoring** using PostgreSQL's built-in tools (free)
6. **Note**: Keep monitoring lightweight on free tier instances due to limited resources

---

## Quick Reference Commands

```bash
# Service Management
sudo systemctl start|stop|restart|status postgresql
sudo systemctl start|stop|restart|status nginx
sudo systemctl start|stop|restart|status fintech-app

# Docker Management
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml ps

# Database Management
sudo -u postgres psql -d fintech_db
sudo systemctl restart postgresql

# Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/postgresql/postgresql-15-main.log
docker compose -f docker-compose.prod.yml logs backend

# Health Checks
curl http://localhost:3001/api/health
curl https://yourdomain.com/api/health
```

---

## Conclusion

Your fintech application should now be running on EC2 with:
- PostgreSQL on an EBS volume for persistent data storage
- Docker containers for backend and frontend
- nginx reverse proxy with SSL/HTTPS (or HTTP if no domain)
- Automatic startup on boot
- Security hardening
- Backup strategy

### Cost Summary (Free Tier)
- **EC2 Instance**: Free (t2.micro/t3.micro) for 12 months
- **EBS Storage**: Free (up to 30GB total) for 12 months
- **Data Transfer**: 15GB outbound free per month
- **Elastic IP**: Free when attached to running instance (optional)
- **Domain Name**: Not included (optional, use IP address for free setup)
- **SSL Certificate**: Free (Let's Encrypt)

**Important Notes**:
- Free tier is valid for **12 months** from AWS account creation
- After free tier expires, you'll be charged for EC2 and EBS usage
- Monitor your AWS billing dashboard to track usage
- Consider upgrading instance type if you need more resources (will incur charges)

For additional support or questions, refer to:
- AWS EC2 Documentation
- AWS Free Tier Documentation
- PostgreSQL Documentation
- Docker Documentation
- nginx Documentation

---

**Last Updated**: 2024
**Version**: 2.0 (Free Tier Optimized)


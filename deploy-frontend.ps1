# PowerShell script to deploy frontend to EC2 without Docker build
# This avoids memory issues on t3.micro instances

$EC2_IP = "13.38.109.133"  # UPDATE THIS IF IP CHANGES
$KEY_PATH = "C:\Users\andre\Downloads\fintech-key.pem"

Write-Host "=== Frontend Deployment to EC2 ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check connection
Write-Host "Step 1: Testing EC2 connection..." -ForegroundColor Green
$testResult = ssh -i $KEY_PATH -o ConnectTimeout=10 ubuntu@$EC2_IP "echo 'connected'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to EC2. Is it running?" -ForegroundColor Red
    Write-Host "Please restart EC2 from AWS Console and update EC2_IP if changed." -ForegroundColor Yellow
    exit 1
}
Write-Host "  Connected successfully!" -ForegroundColor Green

# Step 2: Add swap space (prevents future freezes)
Write-Host ""
Write-Host "Step 2: Adding swap space to prevent memory issues..." -ForegroundColor Green
ssh -i $KEY_PATH ubuntu@$EC2_IP @"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo 'Swap space created!'
else
    echo 'Swap already exists'
fi
free -h
"@
Write-Host "  Swap configured!" -ForegroundColor Green

# Step 3: Build frontend locally
Write-Host ""
Write-Host "Step 3: Building frontend locally..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "  Build complete!" -ForegroundColor Green

# Step 4: Copy built files to EC2
Write-Host ""
Write-Host "Step 4: Copying built files to EC2..." -ForegroundColor Green
scp -i $KEY_PATH -r build/* ubuntu@$EC2_IP:~/frontend-dist/
Write-Host "  Files copied!" -ForegroundColor Green

# Step 5: Configure nginx to serve the files
Write-Host ""
Write-Host "Step 5: Configuring nginx..." -ForegroundColor Green
ssh -i $KEY_PATH ubuntu@$EC2_IP @"
# Move files to nginx directory
sudo rm -rf /var/www/html/*
sudo cp -r ~/frontend-dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html

# Ensure nginx config is correct
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    # Frontend routes (SPA)
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx
echo 'Nginx configured!'
"@

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app should now be accessible at:" -ForegroundColor Green
Write-Host "  - CloudFront: https://d8hyh9dyaxuno.cloudfront.net" -ForegroundColor Yellow
Write-Host "  - Direct EC2: http://$EC2_IP" -ForegroundColor Yellow
Write-Host ""
Write-Host "Remember to invalidate CloudFront cache if needed:" -ForegroundColor White
Write-Host "  aws cloudfront create-invalidation --distribution-id E2YK82RYXFQVSR --paths '/*'" -ForegroundColor Gray


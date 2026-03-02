#!/bin/bash

# VPS Auto-Deploy Script for Innovateam
# Run this on your VPS after initial setup

set -e

echo "🚀 Starting Innovateam VPS Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (use: sudo bash deploy-vps.sh)"
  exit 1
fi

# 1. Update system
echo -e "${YELLOW}[1/9] Updating system...${NC}"
apt update && apt upgrade -y

# 2. Install Node.js
echo -e "${YELLOW}[2/9] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install PM2
echo -e "${YELLOW}[3/9] Installing PM2...${NC}"
npm install -g pm2

# 4. Install Nginx
echo -e "${YELLOW}[4/9] Installing Nginx...${NC}"
apt install -y nginx

# 5. Setup firewall
echo -e "${YELLOW}[5/9] Configuring firewall...${NC}"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

# 6. Create app directory
echo -e "${YELLOW}[6/9] Setting up application...${NC}"
mkdir -p /var/www/innovateam
cd /var/www/innovateam

# 7. Clone repo (you'll need to provide your repo URL)
echo -e "${YELLOW}[7/9] Cloning repository...${NC}"
read -p "Enter your GitHub repo URL: " REPO_URL
git clone $REPO_URL .

# 8. Install dependencies
echo -e "${YELLOW}[8/9] Installing dependencies...${NC}"
cd server
npm install --production

# 9. Setup environment
echo -e "${YELLOW}[9/9] Setting up environment...${NC}"
echo "Please create .env file with your credentials:"
echo "nano /var/www/innovateam/server/.env"
echo ""
echo "Required variables:"
echo "  - NODE_ENV=production"
echo "  - PORT=5000"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - REDIS_URL"
echo "  - REDIS_TOKEN"
echo ""
read -p "Press Enter after creating .env file..."

# Start backend
pm2 start server.js --name innovateam-backend
pm2 startup systemd
pm2 save

# Configure Nginx
cat > /etc/nginx/sites-available/innovateam << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location / {
        root /var/www/innovateam/client/build;
        try_files $uri /index.html;
        add_header Cache-Control "public, max-age=3600";
    }
}
EOF

ln -sf /etc/nginx/sites-available/innovateam /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Build frontend locally: cd client && npm run build"
echo "2. Upload to VPS: scp -r build/* root@YOUR_IP:/var/www/innovateam/client/build/"
echo "3. Visit: http://YOUR_VPS_IP"
echo ""
echo "Useful commands:"
echo "  pm2 logs innovateam-backend  # View logs"
echo "  pm2 restart innovateam-backend  # Restart app"
echo "  pm2 monit  # Monitor resources"

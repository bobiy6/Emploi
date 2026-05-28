#!/bin/bash

# Infralyonix Automatic Deployment Script
# Target: Ubuntu 22.04 LTS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}       Infralyonix Auto-Installation Script         ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# Configuration Prompts
read -p "Enter your domain name (e.g., infralyonix.com): " DOMAIN_NAME
read -s -p "Enter a password for the PostgreSQL user 'infralyonixuser': " DB_PASSWORD
echo ""
read -p "Enter a secure JWT Secret (leave blank to generate one): " JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
fi

echo -e "\n${GREEN}Step 1: Updating system...${NC}"
apt update && apt upgrade -y

echo -e "\n${GREEN}Step 2: Installing dependencies (Node.js, PostgreSQL, Nginx, Redis, Git)...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs postgresql postgresql-contrib nginx git redis-server certbot python3-certbot-nginx

echo -e "\n${GREEN}Step 3: Configuring PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE DATABASE infralyonix;" || true
sudo -u postgres psql -c "CREATE USER infralyonixuser WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE infralyonix TO infralyonixuser;"
sudo -u postgres psql -d infralyonix -c "GRANT ALL ON SCHEMA public TO infralyonixuser;"

echo -e "\n${GREEN}Step 4: Preparing Application Folders...${NC}"
INSTALL_DIR="/var/www/infralyonix"
if [ ! -d "$INSTALL_DIR" ]; then
    mkdir -p /var/www
    cp -r $(pwd) "$INSTALL_DIR"
else
    echo -e "${BLUE}Target directory already exists. Using current directory contents to update.${NC}"
    cp -r . "$INSTALL_DIR/"
fi

cd "$INSTALL_DIR"
chown -R $USER:$USER "$INSTALL_DIR"

echo -e "\n${GREEN}Step 5: Setting up Backend...${NC}"
cd "$INSTALL_DIR/backend"
npm install

# Create .env
cat <<EOF > .env
DATABASE_URL="postgresql://infralyonixuser:$DB_PASSWORD@localhost:5432/infralyonix?schema=public"
JWT_SECRET="$JWT_SECRET"
PORT=5000
REDIS_URL="redis://localhost:6379"
EOF

npx prisma generate
npm run build
npx prisma db push
npx prisma db seed

echo -e "\n${GREEN}Step 6: Setting up Frontend...${NC}"
cd "$INSTALL_DIR/frontend"
npm install

# Create .env
cat <<EOF > .env
VITE_API_URL=https://$DOMAIN_NAME/api
EOF

npm run build

echo -e "\n${GREEN}Step 7: Configuring PM2...${NC}"
npm install -g pm2
cd "$INSTALL_DIR/backend"
pm2 delete infralyonix-api 2>/dev/null || true
pm2 start dist/index.js --name infralyonix-api
pm2 save
pm2 startup | tail -n 1 | bash || true

echo -e "\n${GREEN}Step 8: Configuring Nginx...${NC}"
NGINX_CONF="/etc/nginx/sites-available/infralyonix"
cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Frontend (Static Files)
    location / {
        root $INSTALL_DIR/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true
nginx -t
systemctl restart nginx

echo -e "\n${BLUE}====================================================${NC}"
echo -e "${GREEN}       Installation Complete!                       ${NC}"
echo -e "${BLUE}====================================================${NC}"
echo -e "Your application is now available at: ${BLUE}http://$DOMAIN_NAME${NC}"
echo -e "Admin Credentials:"
echo -e "  - Email: ${BLUE}admin@infralyonix.com${NC}"
echo -e "  - Password: ${BLUE}admin123${NC}"
echo -e ""
echo -e "To enable SSL, run: ${BLUE}certbot --nginx -d $DOMAIN_NAME${NC}"
echo -e "${BLUE}====================================================${NC}"

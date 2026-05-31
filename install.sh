#!/bin/bash

# Infralyonix - Ultimate One-Click Automated Deployment Script
# Specifically designed for Ubuntu 22.04 LTS

set -e

# --- Configuration & Styling ---
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear
echo -e "${BLUE}####################################################${NC}"
echo -e "${BLUE}#                                                  #${NC}"
echo -e "${BLUE}#        INFRALYONIX - AUTOMATED INSTALLER         #${NC}"
echo -e "${BLUE}#                                                  #${NC}"
echo -e "${BLUE}####################################################${NC}"
echo ""

# --- Pre-flight Checks ---

# 1. Root check
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run as root (use sudo ./install.sh)${NC}"
  exit 1
fi

# 2. OS check
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        echo -e "${YELLOW}[WARNING] This script is optimized for Ubuntu. Your OS ($ID) might not be fully supported.${NC}"
        read -p "Continue anyway? (y/n) " -n 1 -r < /dev/tty
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi
    fi
else
    echo -e "${RED}[ERROR] Could not detect OS. This script requires Ubuntu 22.04.${NC}"
    exit 1
fi

# --- Gathering Information ---

echo -e "${YELLOW}>>> Configuration Setup${NC}"

# Detect Public IP
PUBLIC_IP=$(hostname -I | awk '{print $1}')

read -p "1. Enter your Domain Name (e.g., panel.infralyonix.com) [$PUBLIC_IP]: " DOMAIN_NAME < /dev/tty
DOMAIN_NAME=${DOMAIN_NAME:-$PUBLIC_IP}

if [ -z "$DOMAIN_NAME" ]; then
    echo -e "${RED}[ERROR] Domain name is required.${NC}"
    exit 1
fi

read -p "2. Enter a name for the project folder [infralyonix]: " PROJECT_FOLDER < /dev/tty
PROJECT_FOLDER=${PROJECT_FOLDER:-infralyonix}

read -s -p "3. Enter a secure PostgreSQL password (leave blank for random): " DB_PASSWORD < /dev/tty
echo ""
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 12)
    echo -e "${BLUE}[INFO] No password provided, generated: $DB_PASSWORD${NC}"
fi

# --- Execution ---

echo -e "\n${GREEN}[1/8] Updating system and installing base tools...${NC}"
apt-get update
apt-get install -y curl wget git build-essential software-properties-common gnupg2 ca-certificates lsb-release

echo -e "\n${GREEN}[2/8] Installing Node.js 20.x, PostgreSQL, Redis, and Nginx...${NC}"
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PostgreSQL
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Redis
apt-get install -y redis-server
systemctl start redis-server
systemctl enable redis-server

# Nginx
apt-get install -y nginx certbot python3-certbot-nginx

echo -e "\n${GREEN}[3/8] Configuring PostgreSQL Database...${NC}"
# Create user and DB (ignore errors if exist)
sudo -u postgres psql -c "CREATE USER infralyonixuser WITH PASSWORD '$DB_PASSWORD';" || true
sudo -u postgres psql -c "ALTER USER infralyonixuser WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE $PROJECT_FOLDER;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $PROJECT_FOLDER TO infralyonixuser;"
sudo -u postgres psql -d $PROJECT_FOLDER -c "GRANT ALL ON SCHEMA public TO infralyonixuser;"

echo -e "\n${GREEN}[4/8] Deploying Files...${NC}"
INSTALL_PATH="/var/www/$PROJECT_FOLDER"
REPO_URL="https://github.com/bobiy6/Emploi.git"

if [ -d "$INSTALL_PATH" ]; then
    echo -e "${YELLOW}[INFO] Project directory exists. Updating...${NC}"
    cd "$INSTALL_PATH"
    git pull || echo -e "${YELLOW}[WARNING] Could not pull updates. Continuing...${NC}"
else
    echo -e "${GREEN}[INFO] Cloning repository from $REPO_URL...${NC}"
    git clone "$REPO_URL" "$INSTALL_PATH"
    cd "$INSTALL_PATH"
fi

echo -e "\n${GREEN}[5/8] Setting up Backend...${NC}"
cd "$INSTALL_PATH/backend"
npm install

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# Create .env
cat <<EOF > .env
DATABASE_URL="postgresql://infralyonixuser:$DB_PASSWORD@localhost:5432/$PROJECT_FOLDER?schema=public"
JWT_SECRET="$JWT_SECRET"
PORT=5000
REDIS_URL="redis://localhost:6379"
EOF

npx prisma generate
npm run build
npx prisma db push --accept-data-loss
npx prisma db seed

echo -e "\n${GREEN}[6/8] Setting up Frontend...${NC}"
cd "$INSTALL_PATH/frontend"
npm install

# Create .env
cat <<EOF > .env
VITE_API_URL=https://$DOMAIN_NAME/api
EOF

npm run build

echo -e "\n${GREEN}[7/8] Configuring PM2 Process Manager...${NC}"
npm install -g pm2
cd "$INSTALL_PATH/backend"
pm2 delete infralyonix-api 2>/dev/null || true
pm2 start dist/index.js --name infralyonix-api
pm2 save
pm2 startup | grep "sudo" | bash || true

echo -e "\n${GREEN}[8/8] Configuring Nginx Reverse Proxy...${NC}"
NGINX_CONF="/etc/nginx/sites-available/$PROJECT_FOLDER"
cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name $DOMAIN_NAME;

    # Frontend
    location / {
        root $INSTALL_PATH/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # API Backend
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

# Finalizing
clear
echo -e "${BLUE}####################################################${NC}"
echo -e "${GREEN}#       INSTALLATION COMPLETE - INFRALYONIX        #${NC}"
echo -e "${BLUE}####################################################${NC}"
echo ""
echo -e "Your platform is live at: ${BLUE}http://$DOMAIN_NAME${NC}"
echo -e ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. ${GREEN}Enable SSL (HTTPS):${NC} Run this command:"
echo -e "   ${BLUE}certbot --nginx -d $DOMAIN_NAME${NC}"
echo ""
echo -e "2. ${GREEN}Admin Access:${NC}"
echo -e "   - URL: http://$DOMAIN_NAME/login"
echo -e "   - User: ${BLUE}admin@infralyonix.com${NC}"
echo -e "   - Pass: ${BLUE}admin123${NC}"
echo ""
echo -e "3. ${GREEN}DB Details:${NC} User: ${BLUE}infralyonixuser${NC} | Pass: ${BLUE}$DB_PASSWORD${NC}"
echo ""
echo -e "${BLUE}####################################################${NC}"

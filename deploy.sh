#!/bin/bash
# Production Deployment Script for Flask App on Linux Mint
# This script sets up Gunicorn as the WSGI server with systemd service

set -e

echo "========================================="
echo "Flask Production Deployment Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="geovis_website"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_USER="$USER"
VENV_DIR="$APP_DIR/venv"
GUNICORN_WORKERS=4
GUNICORN_PORT=8000

echo -e "${YELLOW}Configuration:${NC}"
echo "  App Name: $APP_NAME"
echo "  App Directory: $APP_DIR"
echo "  Service User: $SERVICE_USER"
echo "  Virtual Environment: $VENV_DIR"
echo "  Gunicorn Workers: $GUNICORN_WORKERS"
echo "  Port: $GUNICORN_PORT"
echo ""

# Check if running as root for systemd setup
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Not running as root. Will use sudo for systemd setup.${NC}"
    USE_SUDO="sudo"
else
    USE_SUDO=""
fi

# Step 1: Install system dependencies
echo -e "${GREEN}Step 1: Installing system dependencies...${NC}"
$USE_SUDO apt-get update
$USE_SUDO apt-get install -y python3 python3-pip python3-venv nginx

# Step 2: Create virtual environment
echo -e "${GREEN}Step 2: Creating virtual environment...${NC}"
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Step 3: Activate virtual environment and install dependencies
echo -e "${GREEN}Step 3: Installing Python dependencies...${NC}"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip
pip install -r "$APP_DIR/requirements.txt"
pip install gunicorn

# Step 4: Create Gunicorn configuration file
echo -e "${GREEN}Step 4: Creating Gunicorn configuration...${NC}"
cat > "$APP_DIR/gunicorn_config.py" << EOF
# Gunicorn configuration file
import multiprocessing

# Server socket
bind = '0.0.0.0:$GUNICORN_PORT'
backlog = 2048

# Worker processes
workers = $GUNICORN_WORKERS
worker_class = 'sync'
worker_connections = 1000
timeout = 30
keepalive = 2

# Logging
accesslog = '$APP_DIR/logs/gunicorn-access.log'
errorlog = '$APP_DIR/logs/gunicorn-error.log'
loglevel = 'info'

# Process naming
proc_name = '$APP_NAME'

# Server mechanics
daemon = False
pidfile = '$APP_DIR/logs/gunicorn.pid'
umask = 0
user = None
group = None
tmp_upload_dir = None

# SSL (uncomment if using HTTPS)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'
EOF

# Step 5: Create logs directory
echo -e "${GREEN}Step 5: Creating logs directory...${NC}"
mkdir -p "$APP_DIR/logs"

# Step 6: Create systemd service file
echo -e "${GREEN}Step 6: Creating systemd service...${NC}"
$USE_SUDO tee /etc/systemd/system/${APP_NAME}.service > /dev/null << EOF
[Unit]
Description=Gunicorn instance to serve $APP_NAME
After=network.target

[Service]
User=$SERVICE_USER
Group=www-data
WorkingDirectory=$APP_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/gunicorn --config $APP_DIR/gunicorn_config.py app:app

[Install]
WantedBy=multi-user.target
EOF

# Step 7: Create Nginx configuration
echo -e "${GREEN}Step 7: Creating Nginx configuration...${NC}"
$USE_SUDO tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << EOF
server {
    listen 80;
    server_name localhost;  # Change this to your domain name

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;

    # Static files
    location /static {
        alias $APP_DIR/static;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:$GUNICORN_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Step 8: Enable Nginx site
echo -e "${GREEN}Step 8: Enabling Nginx site...${NC}"
$USE_SUDO ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
$USE_SUDO rm -f /etc/nginx/sites-enabled/default  # Remove default site

# Step 9: Test Nginx configuration
echo -e "${GREEN}Step 9: Testing Nginx configuration...${NC}"
$USE_SUDO nginx -t

# Step 10: Reload systemd, enable and start services
echo -e "${GREEN}Step 10: Starting services...${NC}"
$USE_SUDO systemctl daemon-reload
$USE_SUDO systemctl enable ${APP_NAME}
$USE_SUDO systemctl start ${APP_NAME}
$USE_SUDO systemctl restart nginx

# Step 11: Check service status
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Service Status:"
$USE_SUDO systemctl status ${APP_NAME} --no-pager -l

echo ""
echo -e "${GREEN}Useful Commands:${NC}"
echo "  Start service:   sudo systemctl start ${APP_NAME}"
echo "  Stop service:    sudo systemctl stop ${APP_NAME}"
echo "  Restart service: sudo systemctl restart ${APP_NAME}"
echo "  View logs:       sudo journalctl -u ${APP_NAME} -f"
echo "  View app logs:   tail -f $APP_DIR/logs/gunicorn-error.log"
echo ""
echo -e "${GREEN}Your application is now running at:${NC}"
echo "  http://localhost"
echo "  http://$(hostname -I | awk '{print $1}')"
echo ""
echo -e "${YELLOW}Note: If you're using a firewall, make sure port 80 is open:${NC}"
echo "  sudo ufw allow 80/tcp"
echo "  sudo ufw allow 443/tcp  # For HTTPS"
echo ""

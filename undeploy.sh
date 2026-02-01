#!/bin/bash
# Remove production deployment (use with caution!)

APP_NAME="geovis_website"

echo "WARNING: This will remove the production deployment."
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo "Stopping and disabling service..."
sudo systemctl stop ${APP_NAME}
sudo systemctl disable ${APP_NAME}

echo "Removing systemd service file..."
sudo rm -f /etc/systemd/system/${APP_NAME}.service

echo "Removing Nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/${APP_NAME}
sudo rm -f /etc/nginx/sites-available/${APP_NAME}

echo "Reloading systemd and restarting Nginx..."
sudo systemctl daemon-reload
sudo systemctl restart nginx

echo ""
echo "Production deployment removed successfully."
echo "Note: Virtual environment and logs are preserved."
echo "To remove them manually, delete:"
echo "  - venv/"
echo "  - logs/"
echo "  - gunicorn_config.py"

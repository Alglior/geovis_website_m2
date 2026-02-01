#!/bin/bash
# Restart the production server

APP_NAME="geovis_website"

echo "Restarting $APP_NAME service..."
sudo systemctl restart ${APP_NAME}
sudo systemctl restart nginx

echo "Service status:"
sudo systemctl status ${APP_NAME} --no-pager -l

echo ""
echo "Application is running at:"
echo "  http://localhost"
echo "  http://$(hostname -I | awk '{print $1}')"

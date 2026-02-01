#!/bin/bash
# Stop the production server

APP_NAME="geovis_website"

echo "Stopping $APP_NAME service..."
sudo systemctl stop ${APP_NAME}

echo "Service status:"
sudo systemctl status ${APP_NAME} --no-pager -l

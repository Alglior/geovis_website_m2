#!/bin/bash
# View application logs

APP_NAME="geovis_website"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Select log to view:"
echo "1) Application logs (tail -f)"
echo "2) Gunicorn access log"
echo "3) Gunicorn error log"
echo "4) Systemd service log"
echo "5) Nginx access log"
echo "6) Nginx error log"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo "Viewing application logs (Ctrl+C to exit)..."
        tail -f "$APP_DIR/logs/gunicorn-error.log"
        ;;
    2)
        echo "Viewing Gunicorn access log (Ctrl+C to exit)..."
        tail -f "$APP_DIR/logs/gunicorn-access.log"
        ;;
    3)
        echo "Viewing Gunicorn error log (Ctrl+C to exit)..."
        tail -f "$APP_DIR/logs/gunicorn-error.log"
        ;;
    4)
        echo "Viewing systemd service log (Ctrl+C to exit)..."
        sudo journalctl -u ${APP_NAME} -f
        ;;
    5)
        echo "Viewing Nginx access log (Ctrl+C to exit)..."
        sudo tail -f /var/log/nginx/${APP_NAME}_access.log
        ;;
    6)
        echo "Viewing Nginx error log (Ctrl+C to exit)..."
        sudo tail -f /var/log/nginx/${APP_NAME}_error.log
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

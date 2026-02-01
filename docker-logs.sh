#!/bin/bash
# View Docker container logs

echo "Select logs to view:"
echo "1) All services"
echo "2) Web application (Flask)"
echo "3) Nginx"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo "Viewing all logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    2)
        echo "Viewing web application logs (Ctrl+C to exit)..."
        docker-compose logs -f web
        ;;
    3)
        echo "Viewing Nginx logs (Ctrl+C to exit)..."
        docker-compose logs -f nginx
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

#!/bin/bash
# Stop Docker containers

echo "Stopping Docker containers..."
docker-compose down

echo ""
echo "Containers stopped successfully."
echo ""
echo "To remove all data (including volumes):"
echo "  docker-compose down -v"

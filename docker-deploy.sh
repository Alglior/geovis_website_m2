#!/bin/bash
# Docker deployment script for Flask application

set -e

echo "========================================="
echo "Docker Deployment for GeoVis Website"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed.${NC}"
    echo "Please install Docker first:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install docker.io docker-compose"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose first:"
    echo "  sudo apt-get install docker-compose"
    exit 1
fi

# Check if user is in docker group
if ! groups | grep -q docker; then
    echo -e "${YELLOW}Warning: Current user is not in docker group.${NC}"
    echo "You may need to use sudo for Docker commands."
    echo "To add your user to docker group:"
    echo "  sudo usermod -aG docker \$USER"
    echo "  newgrp docker"
    echo ""
fi

# Create logs directory
echo -e "${GREEN}Creating logs directory...${NC}"
mkdir -p logs

# Stop existing containers
echo -e "${GREEN}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start containers
echo -e "${GREEN}Building Docker images...${NC}"
docker-compose build

echo -e "${GREEN}Starting containers...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo ""
echo -e "${GREEN}Waiting for services to be healthy...${NC}"
sleep 5

# Check container status
echo ""
echo -e "${GREEN}Container Status:${NC}"
docker-compose ps

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}Deployment Successful!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "Your application is now running at:"
    echo "  http://localhost"
    echo "  http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo "  View logs:           docker-compose logs -f"
    echo "  View web logs:       docker-compose logs -f web"
    echo "  View nginx logs:     docker-compose logs -f nginx"
    echo "  Restart:             docker-compose restart"
    echo "  Stop:                docker-compose down"
    echo "  Rebuild:             docker-compose up -d --build"
    echo "  Shell access:        docker-compose exec web bash"
    echo ""
else
    echo ""
    echo -e "${RED}Deployment failed! Check logs:${NC}"
    echo "  docker-compose logs"
    exit 1
fi

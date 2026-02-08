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
    echo "Please install Docker first."
    exit 1
fi

# Detect Docker Compose version (V2 "docker compose" or V1 "docker-compose")
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    echo "Please install the docker-compose-plugin or standalone docker-compose."
    exit 1
fi

echo -e "${GREEN}Using Compose command: ${DOCKER_COMPOSE}${NC}"

# Check if user is in docker group
if ! groups | grep -q docker; then
    echo -e "${YELLOW}Warning: Current user is not in docker group.${NC}"
    echo "You may need to use sudo for Docker commands."
fi

# Create logs directory
echo -e "${GREEN}Creating logs directory...${NC}"
mkdir -p logs

# Stop existing containers
echo -e "${GREEN}Stopping existing containers...${NC}"
$DOCKER_COMPOSE down 2>/dev/null || true

# Build and start containers
echo -e "${GREEN}Building Docker images...${NC}"
$DOCKER_COMPOSE build

echo -e "${GREEN}Starting containers...${NC}"
$DOCKER_COMPOSE up -d

# Wait for services to be healthy
echo ""
echo -e "${GREEN}Waiting for services to be healthy...${NC}"
sleep 5

# Check container status
echo ""
echo -e "${GREEN}Container Status:${NC}"
$DOCKER_COMPOSE ps

# Check if containers are running
if $DOCKER_COMPOSE ps | grep -q "Up\|running"; then
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
    echo "  View logs:           $DOCKER_COMPOSE logs -f"
    echo "  Restart:             $DOCKER_COMPOSE restart"
    echo "  Stop:                $DOCKER_COMPOSE down"
    echo ""
else
    echo ""
    echo -e "${RED}Deployment failed! Check logs:${NC}"
    echo "  $DOCKER_COMPOSE logs"
    exit 1
fi
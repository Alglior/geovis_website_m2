#!/bin/bash
# Quick redeploy with cache clearing

set -e

echo "========================================="
echo "Docker Redeploy with Cache Clear"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Detect Docker Compose version
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}Step 1: Stopping containers...${NC}"
$DOCKER_COMPOSE down

echo -e "${GREEN}Step 2: Rebuilding images...${NC}"
$DOCKER_COMPOSE build --no-cache

echo -e "${GREEN}Step 3: Starting containers...${NC}"
$DOCKER_COMPOSE up -d --force-recreate

echo -e "${GREEN}Step 4: Clearing nginx cache (restart nginx)...${NC}"
$DOCKER_COMPOSE restart nginx

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Redeploy Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}Important: Clear your browser cache!${NC}"
echo "  - Chrome/Firefox: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "  - Or open DevTools > Network > Disable cache"
echo ""
echo "Check status: $DOCKER_COMPOSE ps"
echo "View logs: $DOCKER_COMPOSE logs -f"

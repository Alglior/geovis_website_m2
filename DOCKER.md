# Docker Deployment Guide

This guide explains how to deploy your Flask application using Docker containers on Linux Mint.

## Prerequisites

### Install Docker

```bash
# Update package index
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io docker-compose

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or log out and back in)
newgrp docker

# Verify installation
docker --version
docker-compose --version
```

## Quick Start

### 1. Deploy with Docker

Run the deployment script:

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

The script will:
- Build the Docker image
- Create containers for Flask app and Nginx
- Set up networking between containers
- Start all services
- Configure health checks

### 2. Access Your Application

After deployment:
- `http://localhost` - Main application
- `http://YOUR_SERVER_IP` - Access from network

## Management Scripts

### View Logs

```bash
./docker-logs.sh
```

Choose from:
1. All services
2. Web application (Flask)
3. Nginx

### Stop Containers

```bash
./docker-stop.sh
```

### Restart Containers

```bash
docker-compose restart
```

## Docker Commands

### Container Management

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web
docker-compose logs -f nginx
```

### Execute Commands in Container

```bash
# Access Flask container shell
docker-compose exec web bash

# Run Flask commands
docker-compose exec web flask --version

# View Python packages
docker-compose exec web pip list
```

### Resource Management

```bash
# View resource usage
docker stats

# Remove stopped containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove unused images
docker image prune -a

# Clean up everything
docker system prune -a --volumes
```

## Architecture

### Services

1. **Web (Flask + Gunicorn)**
   - Port: 8000 (internal)
   - Workers: 4
   - Non-root user: appuser
   - Health checks enabled

2. **Nginx (Reverse Proxy)**
   - Port: 80 (public)
   - Static file serving
   - Gzip compression
   - Security headers
   - Health checks enabled

### Network

- Bridge network: `geovis_network`
- Internal communication between containers
- Only Nginx exposed to host

## Configuration

### Environment Variables

Edit `docker-compose.yml`:

```yaml
environment:
  - FLASK_ENV=production
  - FLASK_APP=app.py
  # Add custom variables
```

### Gunicorn Settings

Edit `Dockerfile` CMD line:

```dockerfile
CMD ["gunicorn", "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--timeout", "60", \
     "app:app"]
```

### Nginx Configuration

Edit `nginx.conf` for custom settings:
- Port changes
- SSL/HTTPS
- Cache settings
- Custom headers

### Port Mapping

Edit `docker-compose.yml`:

```yaml
ports:
  - "8080:80"  # Change external port
```

## SSL/HTTPS Setup

### 1. Generate or Obtain Certificates

```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot
sudo certbot certonly --standalone -d your-domain.com

# Or create self-signed (testing only)
mkdir ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

### 2. Update docker-compose.yml

Uncomment SSL volume mount:

```yaml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl:ro
```

### 3. Update nginx.conf

Uncomment SSL server block and update paths.

### 4. Restart

```bash
docker-compose down
docker-compose up -d
```

## Persistent Data

### Volumes

Data persisted outside containers:

```bash
./static/data/  # Application data
./logs/         # Application logs
```

### Backup

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz static/data/ logs/

# Restore
tar -xzf backup-YYYYMMDD.tar.gz
```

## Performance Tuning

### Gunicorn Workers

Formula: `(2 × CPU_CORES) + 1`

Edit `Dockerfile`:

```dockerfile
CMD ["gunicorn", "--workers", "8", ...]
```

### Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  web:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '1'
          memory: 512M
```

### Nginx Caching

Edit `nginx.conf` for aggressive caching:

```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Troubleshooting

### Container Won't Start

```bash
# View detailed logs
docker-compose logs web

# Check container status
docker-compose ps

# Inspect container
docker inspect geovis_website

# Check if port is already in use
sudo netstat -tlnp | grep :80
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER .

# Fix docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

### Network Issues

```bash
# Check network
docker network ls
docker network inspect geovis_network

# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

### Health Check Failures

```bash
# View health status
docker-compose ps

# Check health logs
docker inspect --format='{{json .State.Health}}' geovis_website

# Test manually
docker-compose exec web curl http://localhost:8000
```

### Build Failures

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check Dockerfile syntax
docker build -t test .
```

## Monitoring

### Container Health

```bash
# Real-time stats
docker stats

# View all containers
docker ps -a

# Inspect container
docker inspect geovis_website
```

### Application Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 2h
```

### Resource Usage

```bash
# Disk usage
docker system df

# Detailed breakdown
docker system df -v

# Container sizes
docker ps -s
```

## Production Best Practices

### Security

1. **Don't run as root** - Already configured in Dockerfile
2. **Use secrets** - For sensitive data
3. **Update regularly** - Keep images up to date
4. **Scan images** - Use `docker scan` for vulnerabilities
5. **Enable firewall** - Restrict ports

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Automated Updates

```bash
# Create update script
cat > update-docker.sh << 'EOF'
#!/bin/bash
cd /path/to/app
git pull
docker-compose down
docker-compose up -d --build
EOF

chmod +x update-docker.sh
```

### Logging

Configure log rotation in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Backup Strategy

```bash
# Automated backup script
cat > backup-docker.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/geovis"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/data-$DATE.tar.gz static/data/
docker-compose exec -T postgres pg_dump -U user database > $BACKUP_DIR/db-$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup-docker.sh

# Add to crontab (daily at 2am)
# 0 2 * * * /path/to/backup-docker.sh
```

## Development vs Production

### Development (with hot reload)

```yaml
# docker-compose.dev.yml
services:
  web:
    command: flask run --host=0.0.0.0 --port=8000 --reload
    environment:
      - FLASK_ENV=development
    volumes:
      - .:/app
```

Run with:
```bash
docker-compose -f docker-compose.dev.yml up
```

### Production

Use standard `docker-compose.yml` with Gunicorn.

## Migration from VM Deployment

If you have existing VM deployment:

1. Stop systemd services:
```bash
sudo systemctl stop geovis_website
sudo systemctl stop nginx
```

2. Deploy with Docker:
```bash
./docker-deploy.sh
```

3. Both deployments can coexist on different ports.

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Flask in Production](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify container status: `docker-compose ps`
3. Test manually: `docker-compose exec web curl localhost:8000`
4. Rebuild: `docker-compose up -d --build`

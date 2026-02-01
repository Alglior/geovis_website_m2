# Production Deployment Guide

This guide explains how to deploy your Flask application on a Linux Mint XFCE server using Gunicorn and Nginx.

## Quick Start

### 1. Deploy the Application

Run the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Install system dependencies (Python, Nginx)
- Create a virtual environment
- Install Python dependencies including Gunicorn
- Configure Gunicorn with optimal settings
- Create systemd service for auto-start
- Configure Nginx as reverse proxy
- Start all services

### 2. Access Your Application

After deployment, your application will be available at:
- `http://localhost`
- `http://YOUR_SERVER_IP`

## Management Scripts

### Start/Stop/Restart

```bash
# Stop the service
./stop_production.sh

# Restart the service
./restart_production.sh
```

### View Logs

```bash
./view_logs.sh
```

Select from:
1. Application logs (combined)
2. Gunicorn access log
3. Gunicorn error log
4. Systemd service log
5. Nginx access log
6. Nginx error log

### Remove Deployment

```bash
./undeploy.sh
```

## Manual Commands

### Service Management

```bash
# Start service
sudo systemctl start geovis_website

# Stop service
sudo systemctl stop geovis_website

# Restart service
sudo systemctl restart geovis_website

# Check status
sudo systemctl status geovis_website

# View logs
sudo journalctl -u geovis_website -f
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## Configuration

### Gunicorn Settings

Edit `gunicorn_config.py` to modify:
- Number of workers
- Port binding
- Timeouts
- Logging levels

After changes, restart the service:
```bash
sudo systemctl restart geovis_website
```

### Nginx Settings

Edit `/etc/nginx/sites-available/geovis_website` to modify:
- Server name (domain)
- SSL certificates
- Cache settings
- Security headers

After changes, test and reload:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Firewall Configuration

If you're using UFW firewall:

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for SSL)
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## SSL/HTTPS Setup (Optional)

### Using Let's Encrypt (Free SSL)

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Obtain certificate (replace YOUR_DOMAIN):
```bash
sudo certbot --nginx -d YOUR_DOMAIN
```

3. Auto-renewal is configured automatically

### Manual SSL Certificate

Edit `/etc/nginx/sites-available/geovis_website` and update:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name YOUR_DOMAIN;
    return 301 https://$server_name$request_uri;
}
```

Then restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Performance Tuning

### Gunicorn Workers

Rule of thumb: `(2 × CPU_CORES) + 1`

Edit `gunicorn_config.py`:
```python
workers = 4  # Adjust based on your CPU cores
```

### System Resources

Monitor resource usage:
```bash
# View process info
htop

# Check service resource usage
systemctl status geovis_website
```

## Troubleshooting

### Service Won't Start

1. Check logs:
```bash
sudo journalctl -u geovis_website -n 50
tail -f logs/gunicorn-error.log
```

2. Verify virtual environment:
```bash
source venv/bin/activate
python -c "import flask; print(flask.__version__)"
```

3. Test app manually:
```bash
source venv/bin/activate
gunicorn --config gunicorn_config.py app:app
```

### Nginx Errors

1. Test configuration:
```bash
sudo nginx -t
```

2. Check error log:
```bash
sudo tail -f /var/log/nginx/geovis_website_error.log
```

3. Verify port availability:
```bash
sudo netstat -tlnp | grep :8000
```

### Permission Issues

1. Check file ownership:
```bash
ls -la
```

2. Fix permissions:
```bash
chmod -R 755 static/
sudo chown -R $USER:www-data .
```

### Port Already in Use

Change port in `gunicorn_config.py`:
```python
bind = '0.0.0.0:8080'  # Use different port
```

Update Nginx config accordingly in `/etc/nginx/sites-available/geovis_website`.

## Updates and Maintenance

### Deploy Code Updates

```bash
# Pull latest code
git pull  # or copy new files

# Restart service to apply changes
./restart_production.sh
```

### Update Dependencies

```bash
source venv/bin/activate
pip install -r requirements.txt --upgrade
sudo systemctl restart geovis_website
```

### Backup

Important files/directories to backup:
- `static/data/` - Your data files
- `logs/` - Application logs
- `gunicorn_config.py` - Gunicorn configuration
- `/etc/nginx/sites-available/geovis_website` - Nginx config
- `/etc/systemd/system/geovis_website.service` - Systemd service

## Monitoring

### Check Application Health

```bash
# HTTP status check
curl -I http://localhost

# Response time check
curl -w "@-" -o /dev/null -s http://localhost <<'EOF'
    time_namelookup:  %{time_namelookup}\n
       time_connect:  %{time_connect}\n
    time_appconnect:  %{time_appconnect}\n
   time_pretransfer:  %{time_pretransfer}\n
      time_redirect:  %{time_redirect}\n
 time_starttransfer:  %{time_starttransfer}\n
                    ----------\n
         time_total:  %{time_total}\n
EOF
```

### System Resource Usage

```bash
# CPU and memory
top -p $(pgrep -f gunicorn)

# Disk usage
df -h
du -sh logs/
```

## Development vs Production

### Development (Flask dev server)
```bash
python app.py
# or
./start.sh
```

### Production (Gunicorn + Nginx)
```bash
./deploy.sh  # First time
./restart_production.sh  # Subsequent restarts
```

## Support

For issues:
1. Check logs using `./view_logs.sh`
2. Verify service status: `sudo systemctl status geovis_website`
3. Test manually: `source venv/bin/activate && gunicorn app:app`

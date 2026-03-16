# Deployment Guide

## Overview

AncerLarins runs on a single VPS using Docker Compose. All 19 services (app, database, cache, monitoring) run on one machine. This guide covers server setup, deployment, SSL, backups, and maintenance.

---

## Requirements

### Server Specs (Minimum)

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Network | 1 Gbps | 1 Gbps |

### Domain & DNS

Point your domain to the server IP:

```
A    ancerlarins.com       → <SERVER_IP>
A    www.ancerlarins.com   → <SERVER_IP>
A    api.ancerlarins.com   → <SERVER_IP>   (optional, if using subdomain)
```

---

## Server Setup

### 1. Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/your-org/ancerlarins.git
sudo chown -R $USER:$USER ancerlarins
cd ancerlarins
```

### 3. Configure Environment

```bash
cd deployment/docker
cp ../../backend/.env.example .env
```

Edit `.env` with production values:

```env
# ── App ───────────────────────────────────────────
APP_NAME=AncerLarins
APP_ENV=production
APP_DEBUG=false
APP_URL=https://ancerlarins.com

# ── Database ──────────────────────────────────────
DB_DATABASE=ancerlarins
DB_USERNAME=ancerlarins
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# ── Redis ─────────────────────────────────────────
REDIS_PASSWORD=<STRONG_PASSWORD_HERE>

# ── External Services ────────────────────────────
TERMII_API_KEY=<your_termii_key>
PAYSTACK_SECRET_KEY=<your_paystack_secret>
PAYSTACK_PUBLIC_KEY=<your_paystack_public>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# ── Monitoring ────────────────────────────────────
GRAFANA_ADMIN_PASSWORD=<STRONG_PASSWORD_HERE>
SENTRY_DSN=<your_sentry_dsn>

# ── Backups (optional S3) ────────────────────────
BACKUP_S3_BUCKET=ancerlarins-backups
AWS_ACCESS_KEY_ID=<your_key>
AWS_SECRET_ACCESS_KEY=<your_secret>
AWS_DEFAULT_REGION=af-south-1
```

### 4. Generate App Key

```bash
# Generate a Laravel app key
docker compose run --rm backend php artisan key:generate --show
# Add the output to .env as APP_KEY=base64:...
```

---

## Initial Deployment

### 1. Build & Start

```bash
cd /opt/ancerlarins/deployment/docker

# Build images
docker compose build

# Start all services
docker compose up -d

# Check all containers are running
docker compose ps
```

### 2. Run Migrations & Seed

```bash
# Run database migrations
docker compose exec backend php artisan migrate --force

# Seed initial data (states, cities, areas, property types)
docker compose exec backend php artisan db:seed --force
```

### 3. SSL Certificate (Let's Encrypt)

The first SSL certificate must be obtained manually:

```bash
# Ensure nginx is running on port 80
docker compose exec certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d ancerlarins.com \
  -d www.ancerlarins.com \
  --email admin@ancerlarins.com \
  --agree-tos \
  --no-eff-email

# Restart nginx to load the certificate
docker compose restart nginx
```

The Certbot container auto-renews certificates every 12 hours.

### 4. Verify

```bash
# Health check
curl https://ancerlarins.com/api/v1/health

# Check logs
docker compose logs -f --tail=50

# Check individual service
docker compose logs backend --tail=20
```

---

## Updating / Redeployment

```bash
cd /opt/ancerlarins

# Pull latest code
git pull origin main

# Rebuild and restart
cd deployment/docker
docker compose build
docker compose up -d

# Run new migrations
docker compose exec backend php artisan migrate --force

# Clear caches
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache
```

### Zero-Downtime Update (Rolling)

```bash
# Rebuild without stopping
docker compose build backend frontend

# Restart one service at a time
docker compose up -d --no-deps backend
docker compose up -d --no-deps worker
docker compose up -d --no-deps scheduler
docker compose up -d --no-deps frontend
docker compose up -d --no-deps nginx
```

---

## Backups

### Automatic Database Backups

The `backup` container runs a daily `pg_dump` automatically:
- Backups stored in the `db_backups` Docker volume
- Retention: 7 days (configurable via `RETENTION_DAYS`)
- Optional S3 upload if `BACKUP_S3_BUCKET` is configured

### Manual Backup

```bash
# Create a manual backup
docker compose exec postgres pg_dump \
  -U ancerlarins \
  -d ancerlarins \
  -F c \
  -f /tmp/backup.dump

# Copy backup out of container
docker compose cp postgres:/tmp/backup.dump ./backup-$(date +%Y%m%d).dump
```

### Restore from Backup

```bash
# Copy backup into container
docker compose cp ./backup.dump postgres:/tmp/backup.dump

# Restore
docker compose exec postgres pg_restore \
  -U ancerlarins \
  -d ancerlarins \
  --clean \
  --if-exists \
  /tmp/backup.dump
```

---

## Monitoring

### Grafana

Access Grafana at `https://ancerlarins.com/grafana/` (proxied by Nginx).

Default credentials:
- Username: `admin`
- Password: Set via `GRAFANA_ADMIN_PASSWORD` in `.env`

Pre-configured dashboards monitor:
- **Application**: Request rate, response times, error rate
- **PostgreSQL**: Connections, query duration, cache hit ratio
- **Redis**: Memory usage, hit rate, connected clients
- **Nginx**: Request rate, status codes, upstream response time
- **Host**: CPU, memory, disk, network

### Prometheus Alerts

Alerts are configured in `deployment/docker/prometheus-alerts.yml`. The Alertmanager routes alerts via `deployment/docker/alertmanager.yml`.

### Log Aggregation

Loki + Promtail collects logs from:
- Backend (Laravel logs from `storage/logs/`)
- Nginx (access and error logs)

Query logs in Grafana → Explore → Loki.

---

## Service Management

### Common Commands

```bash
# View all container statuses
docker compose ps

# View logs (all services)
docker compose logs -f --tail=100

# View logs (specific service)
docker compose logs backend -f --tail=50

# Restart a service
docker compose restart backend

# Stop everything
docker compose down

# Stop and remove volumes (DESTRUCTIVE)
docker compose down -v

# Enter a container shell
docker compose exec backend bash
docker compose exec postgres psql -U ancerlarins

# Run artisan commands
docker compose exec backend php artisan tinker
docker compose exec backend php artisan queue:retry all
```

### Queue Management

```bash
# Check failed jobs
docker compose exec backend php artisan queue:failed

# Retry all failed jobs
docker compose exec backend php artisan queue:retry all

# Restart queue worker (after code changes)
docker compose restart worker
```

### Cache Management

```bash
# Clear all caches
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan view:clear

# Rebuild caches (production)
docker compose exec backend php artisan config:cache
docker compose exec backend php artisan route:cache
docker compose exec backend php artisan view:cache
```

---

## Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] Strong passwords for DB, Redis, Grafana (20+ chars, random)
- [ ] Firewall: only expose ports 80, 443, 22
- [ ] SSH key-only authentication (disable password login)
- [ ] Grafana only accessible via localhost or authenticated proxy
- [ ] Regular OS security updates (`unattended-upgrades`)
- [ ] S3 backups configured and tested
- [ ] Sentry DSN configured for error tracking
- [ ] Termii and Paystack webhook URLs configured in their dashboards

### Firewall Setup (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Troubleshooting

### Container won't start
```bash
docker compose logs <service> --tail=50
```

### Database connection refused
```bash
# Check if postgres is healthy
docker compose ps postgres
# Check PgBouncer
docker compose logs pgbouncer --tail=20
```

### Redis connection refused
```bash
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping
```

### SSL certificate not renewing
```bash
docker compose logs certbot --tail=20
# Manual renewal
docker compose exec certbot certbot renew --dry-run
```

### Out of disk space
```bash
# Check Docker disk usage
docker system df
# Clean up unused images and build cache
docker system prune -a --volumes
```

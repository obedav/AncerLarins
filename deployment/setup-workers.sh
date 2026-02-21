#!/bin/bash
# AncerLarins — Queue Worker & Scheduler Setup
# Run this on your production server (Ubuntu/Debian)
#
# Usage: sudo bash setup-workers.sh

set -e

APP_DIR="/var/www/ancerlarins/backend"
LOG_DIR="/var/log/ancerlarins"
SUPERVISOR_CONF="/etc/supervisor/conf.d/ancerlarins-worker.conf"

echo "=== AncerLarins Worker Setup ==="

# 1. Install Supervisor
if ! command -v supervisord &> /dev/null; then
    echo "Installing Supervisor..."
    apt-get update && apt-get install -y supervisor
else
    echo "Supervisor already installed."
fi

# 2. Create log directory
echo "Creating log directory: $LOG_DIR"
mkdir -p "$LOG_DIR"
chown www-data:www-data "$LOG_DIR"

# 3. Copy Supervisor config
echo "Installing Supervisor config..."
cp "$(dirname "$0")/supervisor/ancerlarins-worker.conf" "$SUPERVISOR_CONF"

# Update paths if APP_DIR is different
if [ "$APP_DIR" != "/var/www/ancerlarins/backend" ]; then
    sed -i "s|/var/www/ancerlarins/backend|$APP_DIR|g" "$SUPERVISOR_CONF"
fi

# 4. Reload and start
echo "Reloading Supervisor..."
supervisorctl reread
supervisorctl update
supervisorctl start all

echo ""
echo "=== Done! ==="
echo ""
echo "Workers running:"
supervisorctl status | grep ancerlarins
echo ""
echo "Useful commands:"
echo "  supervisorctl status                              — check all workers"
echo "  supervisorctl restart ancerlarins-queue-notifications:*  — restart notification workers"
echo "  supervisorctl restart ancerlarins-queue-default:*        — restart default workers"
echo "  supervisorctl stop all                            — stop everything"
echo "  tail -f $LOG_DIR/queue-notifications.log          — watch notification logs"
echo ""
echo "After deploying new code, always restart workers:"
echo "  php artisan queue:restart"

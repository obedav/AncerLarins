#!/bin/sh
set -e

echo "Creating storage link..."
php artisan storage:link --force

echo "Running database migrations..."
php artisan migrate --force

echo "Clearing caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting application..."
exec "$@"

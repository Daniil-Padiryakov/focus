#!/bin/bash
# Start production environment

set -e

echo "🚀 Starting production environment..."

# Check Docker
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running."
  exit 1
fi

# Build and start
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

echo "✅ Production environment started"
echo "Backend health: http://localhost:3000/health"
echo "Frontend: http://localhost:8080"

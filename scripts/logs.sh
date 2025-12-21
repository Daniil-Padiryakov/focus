#!/bin/bash
# ================================
# View Development Logs
# ================================

SERVICE="${1:-}"

if [ -z "$SERVICE" ]; then
  echo "📋 Viewing all logs (press Ctrl+C to exit)"
  echo ""
  docker compose logs -f --tail=50
else
  echo "📋 Viewing logs for: $SERVICE"
  echo ""
  docker compose logs -f --tail=50 "$SERVICE"
fi

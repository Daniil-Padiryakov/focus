#!/bin/bash
# ================================
# Generate Secrets
# ================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔐 Generating secrets...${NC}"
echo ""

mkdir -p secrets

# Database password
if [ ! -f secrets/db_password.txt ]; then
  openssl rand -base64 32 > secrets/db_password.txt
  echo -e "${GREEN}✅ Generated: secrets/db_password.txt${NC}"
else
  echo -e "${YELLOW}⚠️  secrets/db_password.txt already exists${NC}"
fi

# JWT secret
if [ ! -f secrets/jwt_secret.txt ]; then
  openssl rand -base64 32 > secrets/jwt_secret.txt
  echo -e "${GREEN}✅ Generated: secrets/jwt_secret.txt${NC}"
else
  echo -e "${YELLOW}⚠️  secrets/jwt_secret.txt already exists${NC}"
fi

# Refresh token secret
if [ ! -f secrets/refresh_secret.txt ]; then
  openssl rand -base64 32 > secrets/refresh_secret.txt
  echo -e "${GREEN}✅ Generated: secrets/refresh_secret.txt${NC}"
else
  echo -e "${YELLOW}⚠️  secrets/refresh_secret.txt already exists${NC}"
fi

echo ""
echo -e "${GREEN}✅ Secrets generated!${NC}"
echo ""
echo "Files created:"
ls -lh secrets/*.txt 2>/dev/null || echo "No secrets yet"
echo ""
echo -e "${YELLOW}⚠️  NEVER commit these files to Git!${NC}"

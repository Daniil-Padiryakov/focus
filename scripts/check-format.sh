#!/bin/bash
# ================================
# Check Code Formatting
# ================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking code formatting...${NC}"
echo ""

if prettier --check "**/*.{ts,tsx,js,jsx,json,md,yml,yaml}"; then
  echo ""
  echo -e "${GREEN}✅ All files are formatted correctly!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some files need formatting!${NC}"
  echo -e "${YELLOW}Run: pnpm format${NC}"
  exit 1
fi

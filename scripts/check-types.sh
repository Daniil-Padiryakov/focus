#!/bin/bash
# ================================
# TypeScript Type Coverage Check
# ================================

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Checking TypeScript types...${NC}"
echo ""

# Check each package
FAILED=0

check_package() {
  local PACKAGE=$1
  local NAME=$2
  
  echo -n "Checking $NAME... "
  
  if cd "$PACKAGE" && pnpm exec tsc --noEmit 2>&1 | grep -q "error TS"; then
    echo -e "${RED}❌ Failed${NC}"
    cd "$PACKAGE" && pnpm exec tsc --noEmit
    FAILED=1
  else
    echo -e "${GREEN}✅ Passed${NC}"
  fi
  
  cd - > /dev/null
}

# Check packages
check_package "packages/shared" "Shared"
check_package "apps/backend" "Backend"
check_package "apps/frontend" "Frontend"

echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ All type checks passed!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Type check failed!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi

#!/bin/bash
# ================================
# CI Quality Checks
# ================================
# Runs all quality checks для CI/CD

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 Running CI Quality Checks${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

FAILED=0

# 1. Type Check
echo -e "${YELLOW}[1/4] Type checking...${NC}"
if ./scripts/check-types.sh; then
  echo -e "${GREEN}✅ Type check passed${NC}"
else
  echo -e "${RED}❌ Type check failed${NC}"
  FAILED=1
fi
echo ""

# 2. Lint Check
echo -e "${YELLOW}[2/4] Linting...${NC}"
if ./scripts/lint-all.sh; then
  echo -e "${GREEN}✅ Lint check passed${NC}"
else
  echo -e "${RED}❌ Lint check failed${NC}"
  FAILED=1
fi
echo ""

# 3. Format Check
echo -e "${YELLOW}[3/4] Format checking...${NC}"
if ./scripts/check-format.sh; then
  echo -e "${GREEN}✅ Format check passed${NC}"
else
  echo -e "${RED}❌ Format check failed${NC}"
  FAILED=1
fi
echo ""

# 4. Build Check
echo -e "${YELLOW}[4/4] Building...${NC}"
if pnpm build:all; then
  echo -e "${GREEN}✅ Build passed${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  FAILED=1
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All CI checks passed!${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  echo -e "${RED}❌ Some CI checks failed!${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi

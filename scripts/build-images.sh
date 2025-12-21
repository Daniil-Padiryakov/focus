#!/bin/bash
# ================================
# Build Docker Images Locally
# ================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🐳 Building Docker Images${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TARGET="${1:-production}"
TAG="${2:-local}"

# Backend
echo -e "${YELLOW}Building backend ($TARGET)...${NC}"
docker build \
  -f apps/backend/Dockerfile \
  --target $TARGET \
  --tag my-app-backend:$TAG \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

echo -e "${GREEN}✅ Backend image built: my-app-backend:$TAG${NC}"
echo ""

# Frontend
echo -e "${YELLOW}Building frontend ($TARGET)...${NC}"
docker build \
  -f apps/frontend/Dockerfile \
  --target $TARGET \
  --tag my-app-frontend:$TAG \
  --build-arg VITE_API_URL=http://localhost:3000 \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  .

echo -e "${GREEN}✅ Frontend image built: my-app-frontend:$TAG${NC}"
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All images built successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Images:"
docker images | grep "my-app-"
echo ""
echo "Run with:"
echo "  docker run -p 3000:3000 my-app-backend:$TAG"
echo "  docker run -p 8080:80 my-app-frontend:$TAG"

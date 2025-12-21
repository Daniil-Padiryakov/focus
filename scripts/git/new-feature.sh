#!/bin/bash
# ================================
# Create New Feature Branch
# ================================
# Usage: ./scripts/git/new-feature.sh TICKET-123 short-description

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Usage: $0 <ticket-number> <short-description>${NC}"
    echo ""
    echo "Example:"
    echo "  $0 PROJ-123 add-user-auth"
    echo "  $0 456 fix-timer-bug"
    exit 1
fi

TICKET=$1
DESCRIPTION=$2
BRANCH_NAME="feature/${TICKET}-${DESCRIPTION}"

echo -e "${BLUE}🚀 Creating new feature branch${NC}"
echo ""

# Check if git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to stash them? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before creating $BRANCH_NAME"
        echo -e "${GREEN}✅ Changes stashed${NC}"
    else
        echo -e "${RED}❌ Please commit or stash your changes first${NC}"
        exit 1
    fi
fi

# Checkout and update develop
echo -e "${BLUE}📥 Updating develop branch...${NC}"
git checkout develop
git pull origin develop

# Create new branch
echo -e "${BLUE}🌿 Creating branch: $BRANCH_NAME${NC}"
git checkout -b "$BRANCH_NAME"

echo ""
echo -e "${GREEN}✅ Feature branch created successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Make your changes"
echo "  2. git add ."
echo "  3. git commit -m \"feat($TICKET): your commit message\""
echo "  4. git push origin $BRANCH_NAME"
echo "  5. Create Pull Request on GitHub"
echo ""
echo "Commands:"
echo -e "  ${BLUE}git push origin $BRANCH_NAME${NC}"
echo -e "  ${BLUE}gh pr create --base develop --title \"feat: your title\"${NC}"
echo ""

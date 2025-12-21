#!/bin/bash
# ================================
# Sync Feature Branch with Develop
# ================================
# Rebases current branch on latest develop

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Syncing with develop${NC}"
echo ""

# Check if git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check not on protected branches
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
    echo -e "${RED}❌ Cannot sync protected branch: $CURRENT_BRANCH${NC}"
    exit 1
fi

echo -e "Current branch: ${BLUE}$CURRENT_BRANCH${NC}"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    echo ""
    echo -e "${RED}❌ Please commit or stash your changes first${NC}"
    exit 1
fi

# Fetch latest
echo -e "${BLUE}📥 Fetching latest changes...${NC}"
git fetch origin

# Rebase on develop
echo -e "${BLUE}🔀 Rebasing on origin/develop...${NC}"
echo ""

if git rebase origin/develop; then
    echo ""
    echo -e "${GREEN}✅ Successfully synced with develop${NC}"
    echo ""
    echo "To push changes:"
    echo -e "  ${BLUE}git push origin $CURRENT_BRANCH --force-with-lease${NC}"
else
    echo ""
    echo -e "${RED}❌ Rebase failed - conflicts detected${NC}"
    echo ""
    echo "To resolve:"
    echo "  1. Fix conflicts in your editor"
    echo "  2. git add <files>"
    echo "  3. git rebase --continue"
    echo ""
    echo "To abort:"
    echo "  git rebase --abort"
    exit 1
fi

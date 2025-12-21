#!/bin/bash
# ================================
# Cleanup Merged Branches
# ================================
# Deletes local branches that have been merged

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Cleaning up merged branches${NC}"
echo ""

# Check if git repo
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Update develop
echo -e "${BLUE}📥 Updating develop...${NC}"
git checkout develop
git pull origin develop
echo ""

# Find merged branches
echo -e "${BLUE}🔍 Finding merged branches...${NC}"
MERGED_BRANCHES=$(git branch --merged develop | grep -v '^\*' | grep -v 'main' | grep -v 'develop' || true)

if [ -z "$MERGED_BRANCHES" ]; then
    echo -e "${GREEN}✅ No merged branches to clean up${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Found merged branches:${NC}"
echo "$MERGED_BRANCHES"
echo ""

read -p "Delete these branches? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏭️  Skipped cleanup${NC}"
    exit 0
fi

# Delete branches
echo ""
echo "$MERGED_BRANCHES" | while read -r branch; do
    if [ -n "$branch" ]; then
        echo -e "${BLUE}Deleting: $branch${NC}"
        git branch -d "$branch" || true
    fi
done

# Prune remote tracking branches
echo ""
echo -e "${BLUE}🧹 Pruning remote tracking branches...${NC}"
git remote prune origin

echo ""
echo -e "${GREEN}✅ Cleanup complete${NC}"

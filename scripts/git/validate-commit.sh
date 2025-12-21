#!/bin/bash
# ================================
# Validate Commit Message
# ================================
# Checks if commit message follows Conventional Commits

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Skip merge commits
if [[ $COMMIT_MSG =~ ^Merge ]]; then
    exit 0
fi

# Conventional Commits pattern
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z0-9-]+\))?!?: .{1,}"

if [[ ! $COMMIT_MSG =~ $PATTERN ]]; then
    echo ""
    echo -e "${RED}❌ Invalid commit message format${NC}"
    echo ""
    echo "Commit message must follow Conventional Commits:"
    echo ""
    echo "Format: <type>(<scope>): <subject>"
    echo ""
    echo "Types:"
    echo "  feat     - New feature"
    echo "  fix      - Bug fix"
    echo "  docs     - Documentation"
    echo "  style    - Formatting"
    echo "  refactor - Code refactoring"
    echo "  perf     - Performance"
    echo "  test     - Tests"
    echo "  chore    - Maintenance"
    echo "  ci       - CI/CD"
    echo "  build    - Build system"
    echo ""
    echo "Examples:"
    echo "  ✅ feat(auth): add JWT authentication"
    echo "  ✅ fix(timer): prevent race condition"
    echo "  ✅ docs: update README"
    echo "  ✅ feat(api)!: breaking change"
    echo ""
    echo "Your message:"
    echo "  ❌ $COMMIT_MSG"
    echo ""
    exit 1
fi

exit 0

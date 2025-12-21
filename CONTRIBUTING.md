# Contributing Guide

## Git Workflow

### Branch Naming

```
feature/<ticket>-<short-description> fix/<ticket>-<short-description> hotfix/<short-description> chore/<short-description>

```

**Examples:**

- `feature/123-add-user-authentication`
- `fix/456-timer-race-condition`
- `hotfix/critical-database-leak`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/).

**Format:**

````

<type>(<scope>): <subject>

<body> <footer> ```

**Examples:**

```bash
# Feature
feat(auth): add JWT authentication

Implement JWT-based authentication with refresh tokens.
Session expires after 7 days by default.

Closes #123

# Bug fix
fix(timer): prevent race condition on rapid clicks

Timer could be started multiple times if user clicked
start button rapidly. Added debounce to prevent this.

Fixes #456

# Breaking change
feat(api)!: change authentication endpoint

BREAKING CHANGE: /api/login moved to /api/auth/login
All clients must update their API endpoint.
````

### Pull Request Process

1. **Create feature branch from develop**

   ```bash
   # Manual method
   git checkout develop
   git pull origin develop
   git checkout -b feature/123-my-feature

   # OR use helper script (recommended)
   ./scripts/git/new-feature.sh 123 my-feature
   ```

2. **Make your changes**
   - Write clean, tested code
   - Follow code style (enforced by ESLint/Prettier)
   - Update documentation if needed

3. **Commit with conventional commits**

   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to remote**

   ```bash
   git push origin feature/123-my-feature
   ```

5. **Create Pull Request**
   - Base: `develop` (not `main`)
   - Title: Same as commit message
   - Description: Explain WHAT and WHY
   - Link relevant issues

6. **Code Review**
   - Address feedback
   - Push additional commits
   - Request re-review

7. **Merge**
   - Squash and merge (clean history)
   - Delete branch after merge

### Pre-commit Hooks

Pre-commit hooks automatically run:

- ESLint (code quality)
- Prettier (formatting)
- TypeScript type check
- Commit message validation

**If hooks fail:**

```bash
# Auto-fix what's possible
pnpm lint:fix
pnpm format

# Commit again
git add .
git commit
```

### Code Review Checklist

**Before requesting review:**

- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] ESLint/Prettier checks pass
- [ ] No console.log statements
- [ ] Documentation updated
- [ ] Types are explicit (no `any`)

**Reviewers should check:**

- [ ] Code is clear and maintainable
- [ ] Edge cases handled
- [ ] Performance considered
- [ ] Security implications reviewed
- [ ] Tests are comprehensive

## Development Setup

```bash
# Clone repo
git clone <repo-url>
cd my-fullstack-app

# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Run tests
pnpm test:all

# Run linter
pnpm lint:all
```

## Git Helper Scripts

Мы предоставляем скрипты для автоматизации Git workflow:

### Create New Feature Branch

```bash
./scripts/git/new-feature.sh <ticket-number> <description>

# Examples
./scripts/git/new-feature.sh PROJ-123 add-user-auth
./scripts/git/new-feature.sh 456 fix-timer-bug
```

### Sync with Develop

```bash
# Rebase your feature branch on latest develop
./scripts/git/sync-develop.sh
```

### Cleanup Merged Branches

```bash
# Delete local branches that have been merged
./scripts/git/cleanup-branches.sh
```

## Additional Resources

- [Detailed Git Workflow Guide](./GIT_WORKFLOW.md) - Полное руководство по Git процессу
- [Migration Guide](./MIGRATION_GUIDE.md) - Работа с миграциями БД
- [Database README](./apps/backend/src/database/README.md) - База данных

## Questions?

Contact the team or create an issue.

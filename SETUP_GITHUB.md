# GitHub Repository Setup Guide

Пошаговая инструкция по настройке GitHub репозитория с branch protection и автоматизацией.

## 📋 Table of Contents

- [Initial Setup](#initial-setup)
- [Branch Protection Rules](#branch-protection-rules)
- [Labels Setup](#labels-setup)
- [GitHub Actions Secrets](#github-actions-secrets)
- [Required Reviewers](#required-reviewers)
- [Notifications](#notifications)

---

## Initial Setup

### 1. Create Repository (if not exists)

```bash
# On GitHub
# 1. Go to https://github.com/new
# 2. Repository name: focus
# 3. Description: Pomodoro timer application
# 4. Private/Public as needed
# 5. Don't add README, .gitignore, license (we have them)
# 6. Create repository

# Locally
git remote add origin https://github.com/your-org/focus.git
git push -u origin main
git push origin develop
```

### 2. Update Remote URLs in Documentation

Update in `.github/ISSUE_TEMPLATE/config.yml`:

```yaml
contact_links:
  - name: 📚 Documentation
    url: https://github.com/YOUR-ORG/focus/wiki # ← Change this
    about: Check our documentation for common questions
```

---

## Branch Protection Rules

### Main Branch Protection

**Settings → Branches → Add rule**

**Branch name pattern:** `main`

#### Protect matching branches

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **2**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `CI / backend`
    - `CI / frontend`
    - `CI / shared`
    - `Code Quality / format`
    - `Code Quality / commit-message`
    - `Branch Protection / validate-branch`
    - `Branch Protection / validate-pr-title`
    - `Branch Protection / validate-target-branch`

- ✅ **Require conversation resolution before merging**

- ✅ **Require signed commits** (optional, recommended)

- ✅ **Require linear history** (optional)

- ✅ **Include administrators**

- ❌ **Allow force pushes** (NEVER)

- ❌ **Allow deletions** (NEVER)

#### Rules applied to everyone including administrators

- ✅ All of the above

---

### Develop Branch Protection

**Branch name pattern:** `develop`

#### Protect matching branches

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks:**
    - `CI / backend`
    - `CI / frontend`
    - `Code Quality / format`
    - `Branch Protection / validate-branch`
    - `Branch Protection / validate-pr-title`

- ✅ **Require conversation resolution before merging**

- ❌ **Allow force pushes** (NEVER for develop)

---

## Labels Setup

### Automatic Labels Import

```bash
# Install gh CLI if not installed
brew install gh  # macOS
# or: https://cli.github.com/

# Authenticate
gh auth login

# Import labels from .github/labels.json
gh label create --repo your-org/focus "$(cat .github/labels.json)"
```

### Manual Labels Setup

Go to **Settings → Labels** and create:

#### Type Labels

- `feature` (green) - New feature
- `bug` (red) - Bug fix
- `hotfix` (dark red) - Critical fix
- `refactoring` (yellow) - Code refactoring
- `maintenance` (light yellow) - Chores
- `documentation` (blue) - Docs
- `testing` (light blue) - Tests
- `performance` (purple) - Performance

#### Component Labels

- `backend` (purple)
- `frontend` (light blue)
- `shared` (pink)
- `database` (lavender)
- `docker` (teal)
- `ci-cd` (blue)

#### Size Labels

- `size/XS` (green) - < 50 lines
- `size/S` (light green) - 50-200 lines
- `size/M` (yellow) - 200-500 lines
- `size/L` (orange) - 500-1000 lines
- `size/XL` (red) - > 1000 lines

#### Priority Labels

- `priority/critical` (red)
- `priority/high` (orange)
- `priority/medium` (yellow)
- `priority/low` (green)

---

## GitHub Actions Secrets

### Required Secrets

**Settings → Secrets and variables → Actions → New repository secret**

For deployment and integrations:

```bash
# Docker Hub (if using)
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-token

# AWS (if deploying to AWS)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Database (for CI)
# Usually not needed as we use services

# Other integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SENTRY_AUTH_TOKEN=your-token
```

### Environment Secrets

Create environments for different deployment stages:

**Settings → Environments → New environment**

1. **Staging**
   - DATABASE_URL (staging DB)
   - API_URL (staging API)
   - Required reviewers: 0

2. **Production**
   - DATABASE_URL (production DB)
   - API_URL (production API)
   - Required reviewers: 1+
   - Deployment branches: `main` only

---

## Required Reviewers / Code Owners

### Create CODEOWNERS file

```bash
# .github/CODEOWNERS

# Global owners
* @team-lead @senior-dev

# Backend
/apps/backend/ @backend-team
/apps/backend/src/database/ @backend-team @dba

# Frontend
/apps/frontend/ @frontend-team

# Infrastructure
/docker/ @devops-team
/.github/workflows/ @devops-team
/scripts/ @devops-team

# Documentation
*.md @tech-writer @team-lead

# Configuration
package.json @team-lead
tsconfig*.json @team-lead
.eslintrc* @team-lead
.prettierrc* @team-lead
```

### Enable Code Owners

**Settings → Code review**

- ✅ Require review from Code Owners

---

## Notifications

### Slack Integration (Optional)

1. **Add Slack app:**
   - Go to Slack App Directory
   - Install "GitHub" app
   - Connect to your repository

2. **Configure notifications:**
   ```
   /github subscribe your-org/focus
   /github subscribe your-org/focus reviews
   /github subscribe your-org/focus comments
   ```

### Email Notifications

**Settings → Notifications**

- Configure who gets notified for:
  - Pull requests
  - Issues
  - Releases
  - CI failures

---

## Repository Settings

### General Settings

**Settings → General**

#### Features

- ✅ Issues
- ✅ Wiki (for documentation)
- ❌ Sponsorships
- ❌ Projects (unless you use GitHub Projects)
- ❌ Preserve this repository
- ✅ Discussions (for Q&A)

#### Pull Requests

- ✅ Allow squash merging
  - Default: Pull request title
- ❌ Allow merge commits (we use squash)
- ❌ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Automatically delete head branches

---

## Webhooks (Optional)

**Settings → Webhooks → Add webhook**

### CI/CD Integration

- Payload URL: `https://your-ci-server.com/webhook`
- Content type: `application/json`
- Events:
  - Push
  - Pull request
  - Release

### Deployment Integration

- Payload URL: `https://your-deploy-server.com/webhook`
- Events:
  - Release

---

## Security

### Enable Security Features

**Settings → Security**

#### Dependabot

- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Dependabot version updates

Configure `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
```

#### Code Scanning

- ✅ CodeQL analysis
- Configure `.github/workflows/codeql.yml`

#### Secret Scanning

- ✅ Secret scanning
- ✅ Push protection

---

## Team Setup

### Create Teams

**Organization Settings → Teams**

1. **@backend-team**
   - Members: Backend developers
   - Permissions: Write

2. **@frontend-team**
   - Members: Frontend developers
   - Permissions: Write

3. **@devops-team**
   - Members: DevOps engineers
   - Permissions: Admin (for workflows)

4. **@team-leads**
   - Members: Team leads
   - Permissions: Admin

### Repository Access

**Settings → Collaborators and teams**

- `@team-leads` → Admin
- `@backend-team` → Write
- `@frontend-team` → Write
- `@devops-team` → Write

---

## Verification

### Test Branch Protection

```bash
# 1. Try to push to main directly (should fail)
git checkout main
echo "test" >> README.md
git commit -am "test"
git push origin main
# ❌ Should be rejected

# 2. Create PR from feature branch (should work)
git checkout develop
git checkout -b feature/test-protection
echo "test" >> README.md
git commit -am "feat: test protection"
git push origin feature/test-protection
# Create PR on GitHub
# ✅ Should work with status checks

# 3. Test invalid branch name (should fail CI)
git checkout -b my-invalid-branch
# Push and create PR
# ❌ Should fail "Branch Protection" check
```

### Test CI/CD

```bash
# 1. Create a simple PR
./scripts/git/new-feature.sh TEST-001 ci-test

# 2. Make a change
echo "console.log('test')" >> apps/backend/src/main.ts

# 3. Commit
git add .
git commit -m "feat(test): test CI pipeline"

# 4. Push
git push origin feature/TEST-001-ci-test

# 5. Create PR on GitHub
# ✅ All checks should run automatically
```

---

## Maintenance

### Regular Tasks

#### Weekly

- Review Dependabot PRs
- Check failed workflow runs
- Review open PRs

#### Monthly

- Clean up old branches: `pnpm git:cleanup`
- Review and update labels
- Update documentation

#### Quarterly

- Review branch protection rules
- Update CI/CD workflows
- Review team permissions

---

## Troubleshooting

### CI Checks Not Running

1. Check workflow files are in `.github/workflows/`
2. Verify YAML syntax: `yamllint .github/workflows/*.yml`
3. Check Actions are enabled: Settings → Actions → Allow all actions

### Branch Protection Not Working

1. Ensure you're not an admin (or enable "Include administrators")
2. Check status check names match exactly
3. Verify branch name pattern is correct

### Labels Not Auto-Applying

1. Check `auto-label.yml` workflow runs
2. Verify GitHub token has `pull-requests: write` permission
3. Check workflow logs for errors

---

## Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Code Owners Docs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [Git Workflow Guide](./GIT_WORKFLOW.md)

---

**Questions?** Open an issue or discussion.

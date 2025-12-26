# Git Workflow & Branch Strategy

## 📋 Table of Contents

- [Overview](#overview)
- [Branch Structure](#branch-structure)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)
- [Hotfix Process](#hotfix-process)
- [CI/CD Integration](#cicd-integration)

---

## Overview

Мы используем **Git Flow** стратегию с адаптациями под наш процесс разработки.

### Key Principles

- ✅ `main` - всегда стабильная production версия
- ✅ `develop` - integration ветка для разработки
- ✅ Feature branches - от `develop`, merge обратно в `develop`
- ✅ Hotfix branches - от `main`, merge в `main` И `develop`
- ✅ Защита веток через GitHub branch protection rules
- ✅ CI/CD автоматически запускается на каждый PR

---

## Branch Structure

```
main (protected)
├── v1.0.0 (tag)
├── v1.1.0 (tag)
└── v2.0.0 (tag)

develop (protected)
├── feature/123-user-auth
├── feature/124-pomodoro-timer
├── fix/125-timer-bug
└── chore/126-update-deps

hotfix/critical-security-fix
└── (от main, merge в main + develop)
```

### Branch Descriptions

| Branch       | Purpose             | Base      | Merge to           | Protected | Lifetime  |
| ------------ | ------------------- | --------- | ------------------ | --------- | --------- |
| `main`       | Production код      | -         | -                  | ✅        | Permanent |
| `develop`    | Integration ветка   | `main`    | `main`             | ✅        | Permanent |
| `feature/*`  | Новые фичи          | `develop` | `develop`          | ❌        | Temporary |
| `fix/*`      | Bug fixes           | `develop` | `develop`          | ❌        | Temporary |
| `hotfix/*`   | Критические фиксы   | `main`    | `main` + `develop` | ❌        | Temporary |
| `chore/*`    | Maintenance задачи  | `develop` | `develop`          | ❌        | Temporary |
| `refactor/*` | Рефакторинг         | `develop` | `develop`          | ❌        | Temporary |
| `docs/*`     | Только документация | `develop` | `develop`          | ❌        | Temporary |

---

## Development Workflow

### 1️⃣ Starting New Feature

```bash
# 1. Убедитесь что у вас последняя версия develop
git checkout develop
git pull origin develop

# 2. Создайте feature ветку
git checkout -b feature/123-add-user-profile

# 3. Работайте над задачей
# ... make changes ...

# 4. Коммитьте изменения (следуя Conventional Commits)
git add .
git commit -m "feat(user): add user profile page"

# 5. Пушьте в remote
git push origin feature/123-add-user-profile

# 6. Создайте Pull Request на GitHub
# Base: develop ← Head: feature/123-add-user-profile
```

### 2️⃣ Code Review & Merge

```bash
# После approve PR:
# 1. Squash and Merge через GitHub UI
# 2. Удалите feature ветку (автоматически или вручную)
git branch -d feature/123-add-user-profile
git push origin --delete feature/123-add-user-profile
```

### 3️⃣ Syncing with Develop

```bash
# Если ваша feature ветка отстала от develop
git checkout feature/123-add-user-profile
git fetch origin
git rebase origin/develop

# Если есть конфликты:
# 1. Разрешите конфликты
# 2. git add <files>
# 3. git rebase --continue

# Force push (если уже пушили ветку)
git push origin feature/123-add-user-profile --force-with-lease
```

---

## Branch Naming Convention

### Format

```
<type>/<ticket-number>-<short-description>
```

### Types

- `feature/` - Новая функциональность
- `fix/` - Исправление бага
- `hotfix/` - Критический фикс для production
- `refactor/` - Рефакторинг без изменения функционала
- `chore/` - Maintenance (обновление зависимостей, конфиги)
- `docs/` - Только документация
- `test/` - Добавление или изменение тестов
- `perf/` - Улучшение производительности

### Examples

✅ **Good:**

```bash
feature/PROJ-123-user-authentication
fix/PROJ-456-timer-race-condition
hotfix/critical-db-connection-leak
chore/update-dependencies
refactor/PROJ-789-extract-auth-logic
docs/update-api-documentation
test/PROJ-101-add-e2e-tests
perf/PROJ-202-optimize-db-queries
```

❌ **Bad:**

```bash
my-feature                    # Нет типа и номера
feature/fix-bug              # Неправильный тип
fix/PROJ-123-this-is-a-very-long-description-that-nobody-will-read  # Слишком длинное
test                         # Нет слэша и описания
FIX/bug                     # Caps lock
```

---

## Commit Guidelines

Мы используем [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - Новая фича
- `fix` - Исправление бага
- `docs` - Изменения в документации
- `style` - Форматирование (не влияет на код)
- `refactor` - Рефакторинг
- `perf` - Улучшение производительности
- `test` - Добавление тестов
- `chore` - Maintenance
- `ci` - Изменения в CI/CD
- `build` - Изменения в build системе

### Scope (optional)

Компонент который изменяется:

- `auth` - Аутентификация
- `user` - Пользователи
- `pomodoro` - Pomodoro функционал
- `api` - API endpoints
- `db` - База данных
- `ui` - UI компоненты
- `docker` - Docker конфигурация

### Examples

```bash
# Simple feature
feat(auth): add JWT token refresh

# Bug fix with issue reference
fix(timer): prevent race condition on rapid clicks

Fixes #123

# Breaking change
feat(api)!: change authentication endpoint structure

BREAKING CHANGE: The /api/login endpoint has been moved to /api/auth/login.
All API clients must update their endpoints.

Migration guide: See docs/migration-v2.md

# Multiple changes
feat(user): add profile page with avatar upload

- Add profile page component
- Implement avatar upload with S3
- Add user settings form
- Update API endpoints

Closes #456
Related to #457

# Documentation
docs(readme): update installation instructions

# Chore
chore(deps): update dependencies to latest versions

Updated:
- React 18.2 -> 19.1
- TypeScript 5.6 -> 5.7
- All minor versions

# CI
ci(github): add automatic deployment to staging
```

### Commit Message Rules

✅ **DO:**

- Используйте imperative mood ("add" not "added" or "adds")
- Первое слово с маленькой буквы
- Без точки в конце subject
- Ограничьте subject 72 символами
- Используйте body для детального объяснения WHAT and WHY
- Ссылайтесь на issues/tickets

❌ **DON'T:**

- "Fixed stuff" - неинформативно
- "WIP" commits в финальном PR - squash их
- Множественные несвязанные изменения в одном коммите
- console.log или debug код

---

## Pull Request Process

### 1. Before Creating PR

```bash
# ✅ Checklist перед PR:
pnpm lint              # ESLint проверки
pnpm format            # Prettier форматирование
pnpm typecheck         # TypeScript проверки
pnpm test:all          # Все тесты
pnpm build:all         # Сборка проходит

# Если что-то не проходит:
pnpm lint:fix          # Автофикс линтера
pnpm format            # Автоформатирование
```

### 2. Creating PR

1. **Перейдите на GitHub** → Pull Requests → New Pull Request

2. **Выберите ветки:**
   - Base: `develop` (для feature/fix)
   - Base: `main` (для hotfix)
   - Compare: `feature/123-your-branch`

3. **Заполните PR template:**
   - Описание изменений
   - Тип изменения (feature/fix/etc)
   - Связанные issues
   - Тестирование
   - Checklist
   - Screenshots (если UI)

4. **Назначьте reviewers:**
   - Минимум 1 reviewer
   - Для критических изменений - 2+ reviewers

### 3. During Review

```bash
# Если reviewer просит изменения:

# 1. Сделайте изменения
git add .
git commit -m "fix(review): address review comments"

# 2. Пушьте в ту же ветку
git push origin feature/123-your-branch

# PR автоматически обновится
```

### 4. After Approval

**Squash and Merge:**

- Все коммиты объединяются в один
- Чистая история в develop/main
- Commit message = PR title

**Merge:**

- Используется только для hotfix
- Сохраняет все коммиты

### 5. After Merge

```bash
# 1. Удалите локальную ветку
git checkout develop
git branch -D feature/123-your-branch

# 2. Удалите remote ветку (если не удалилась автоматически)
git push origin --delete feature/123-your-branch

# 3. Обновите develop
git pull origin develop
```

---

## Release Process

### Creating Release from Develop to Main

```bash
# 1. Убедитесь develop стабилен
# - Все тесты проходят
# - Все features завершены
# - QA done

# 2. Создайте PR: develop -> main
git checkout develop
git pull origin develop
# Create PR on GitHub: base=main, head=develop

# 3. После merge в main, создайте tag
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0

Changes:
- Added user authentication
- Fixed timer bugs
- Updated dependencies

Closes #123, #124, #125"

git push origin v1.2.0

# 4. Создайте GitHub Release
# - Go to Releases → Draft new release
# - Choose tag v1.2.0
# - Generate release notes
# - Publish
```

### Semantic Versioning

Мы используем [SemVer](https://semver.org/):

```
MAJOR.MINOR.PATCH

v2.3.1
│ │ │
│ │ └─ PATCH: Bug fixes (обратно совместимые)
│ └─── MINOR: New features (обратно совместимые)
└───── MAJOR: Breaking changes (НЕ обратно совместимые)
```

**Examples:**

- `v1.0.0` → `v1.0.1` - Bug fix
- `v1.0.1` → `v1.1.0` - New feature
- `v1.1.0` → `v2.0.0` - Breaking change

---

## Hotfix Process

Для критических багов в production:

```bash
# 1. Создайте hotfix ветку от main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Сделайте фикс
# ... make changes ...

git add .
git commit -m "fix(security): patch critical vulnerability CVE-2024-XXXXX"

# 3. Пушьте и создайте PR в main
git push origin hotfix/critical-security-fix
# Create PR: base=main, head=hotfix/critical-security-fix

# 4. После merge в main, создайте tag
git checkout main
git pull origin main
git tag -a v1.2.1 -m "Hotfix: Critical security patch"
git push origin v1.2.1

# 5. Merge hotfix в develop тоже!
git checkout develop
git pull origin develop
git merge main
git push origin develop

# 6. Удалите hotfix ветку
git branch -D hotfix/critical-security-fix
git push origin --delete hotfix/critical-security-fix
```

---

## CI/CD Integration

### Automated Checks

CI автоматически запускается на:

- ✅ Push в `main` или `develop`
- ✅ Pull Request в `main` или `develop`

**Проверки:**

1. **Detect Changes** - определяет какие пакеты изменились
2. **Backend CI** - lint, typecheck, tests, build, migrations
3. **Frontend CI** - lint, typecheck, tests, build
4. **Code Quality** - formatting, commit messages, dependencies

### Branch Protection Rules

Рекомендуемые настройки для GitHub:

**Main Branch:**

```yaml
Protection Rules:
  ✅ Require pull request before merging
  ✅ Require approvals: 2
  ✅ Dismiss stale reviews
  ✅ Require review from Code Owners
  ✅ Require status checks to pass:
     - CI / backend
     - CI / frontend
     - Code Quality / format
  ✅ Require branches to be up to date
  ✅ Require conversation resolution
  ✅ Require signed commits (optional)
  ✅ Include administrators
  ❌ Allow force pushes: Never
  ❌ Allow deletions: Never
```

**Develop Branch:**

```yaml
Protection Rules:
  ✅ Require pull request before merging
  ✅ Require approvals: 1
  ✅ Require status checks to pass:
     - CI / backend
     - CI / frontend
  ✅ Require branches to be up to date
  ❌ Allow force pushes: Never
```

### Auto-merge (Optional)

Можно настроить auto-merge для dependabot PRs:

```yaml
# .github/workflows/auto-merge.yml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    # ... auto-merge logic
```

---

## Quick Reference

### Common Commands

```bash
# Начать новую фичу
git checkout develop && git pull && git checkout -b feature/123-name

# Обновить feature ветку с develop
git fetch origin && git rebase origin/develop

# Посмотреть статус
git status

# Посмотреть историю
git log --oneline --graph --all -20

# Откатить последний коммит (keep changes)
git reset --soft HEAD~1

# Откатить последний коммит (discard changes)
git reset --hard HEAD~1

# Удалить локальную ветку
git branch -D feature/123-name

# Удалить remote ветку
git push origin --delete feature/123-name

# Посмотреть все ветки
git branch -a

# Почистить старые ветки
git remote prune origin
```

### GitHub CLI Commands

```bash
# Установить gh CLI
brew install gh  # macOS
# или: https://cli.github.com/

# Создать PR
gh pr create --base develop --title "feat: add feature" --body "Description"

# Посмотреть PR
gh pr view

# Checkout PR локально
gh pr checkout 123

# Merge PR
gh pr merge 123 --squash --delete-branch

# Посмотреть статус checks
gh pr checks
```

---

## Troubleshooting

### Conflict Resolution

```bash
# Если есть конфликты при rebase:
git rebase origin/develop

# 1. Откройте файлы с конфликтами
# 2. Разрешите конфликты (удалите <<<< ==== >>>>)
# 3. Добавьте файлы
git add <files>

# 4. Продолжите rebase
git rebase --continue

# Если запутались - отмените rebase
git rebase --abort
```

### Accidentally Committed to Wrong Branch

```bash
# Если коммитили в develop вместо feature ветки:

# 1. Создайте новую ветку с текущими изменениями
git checkout -b feature/123-my-feature

# 2. Вернитесь в develop
git checkout develop

# 3. Откатите develop на один коммит назад
git reset --hard HEAD~1

# 4. Вернитесь в feature ветку
git checkout feature/123-my-feature
```

### Lost Commits

```bash
# Git reflog показывает все операции
git reflog

# Найдите нужный commit hash
# Восстановите его
git cherry-pick <commit-hash>
```

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [SemVer](https://semver.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Questions?** Ask in Discussions or contact the team lead.

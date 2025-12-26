# Files Reference - Быстрая справка

## 🎯 Какие файлы что делают

### Используются Git/GitHub автоматически

| Файл                               | Кто использует   | Назначение          |
| ---------------------------------- | ---------------- | ------------------- |
| `.gitignore`                       | Git              | Игнорируемые файлы  |
| `.github/workflows/*.yml`          | GitHub Actions   | CI/CD автоматизация |
| `.github/PULL_REQUEST_TEMPLATE.md` | GitHub           | Шаблон для PR       |
| `.github/ISSUE_TEMPLATE/*.yml`     | GitHub           | Шаблоны для Issues  |
| `.github/labels.json`              | Вы (для импорта) | Настройка меток     |
| `.husky/*`                         | Git hooks        | Pre-commit проверки |

### Документация для разработчиков

| Файл                      | Для кого             | Держать в репе?   |
| ------------------------- | -------------------- | ----------------- |
| `README.md`               | Все                  | ✅ Обязательно    |
| `CONTRIBUTING.md`         | Contributors         | ✅ Обязательно    |
| `GIT_WORKFLOW.md`         | Разработчики         | ✅ Да             |
| `MIGRATION_GUIDE.md`      | Backend разработчики | ✅ Да             |
| `REPOSITORY_STRUCTURE.md` | Maintainers          | ✅ Да (этот файл) |
| `FILES_REFERENCE.md`      | Все                  | ✅ Да (quick ref) |
| `SETUP_GITHUB.md`         | DevOps/Lead          | 🤔 Можно в Wiki   |

### Скрипты

| Категория   | Файлы                                               | Нужны?       |
| ----------- | --------------------------------------------------- | ------------ |
| Docker      | `scripts/dev.sh`, `prod.sh`, `logs.sh`, `health.sh` | ✅ Да        |
| Development | `scripts/reset.sh`                                  | ✅ Да        |
| Git helpers | `scripts/git/*.sh`                                  | ✅ Да        |
| CI checks   | `scripts/ci-checks.sh`, `check-*.sh`, `lint-all.sh` | ✅ Да        |
| Unused      | `scripts/generate-secrets.sh`                       | ⚠️ Проверить |

---

## 📂 Полная структура проекта

```
focus/
├── 📄 README.md                      # Главная страница (TODO: обновить)
├── 📄 CONTRIBUTING.md                # Как contribute
├── 📄 GIT_WORKFLOW.md                # Git процесс (детально)
├── 📄 MIGRATION_GUIDE.md             # Database миграции
├── 📄 REPOSITORY_STRUCTURE.md        # Структура репо (детально)
├── 📄 FILES_REFERENCE.md             # Этот файл (quick ref)
├── 📄 SETUP_GITHUB.md                # GitHub setup (можно в Wiki)
│
├── 🔧 .github/
│   ├── workflows/
│   │   ├── ci.yml                   # ✅ Основной CI/CD
│   │   ├── code-quality.yml         # ✅ Code quality checks
│   │   ├── branch-protection.yml    # ✅ Branch/PR validation
│   │   └── auto-label.yml           # ✅ Auto labeling
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml           # ✅ Bug template
│   │   ├── feature_request.yml      # ✅ Feature template
│   │   └── config.yml               # ✅ Issue config
│   ├── PULL_REQUEST_TEMPLATE.md     # ✅ PR template
│   └── labels.json                  # 📋 Labels reference
│
├── 🐳 docker/
│   ├── postgres/
│   │   └── 01-init.sql              # ✅ DB init (Docker only)
│   └── nginx/                       # (если есть)
│
├── 📜 scripts/
│   ├── git/
│   │   ├── new-feature.sh           # ✅ Create feature branch
│   │   ├── sync-develop.sh          # ✅ Sync with develop
│   │   ├── cleanup-branches.sh      # ✅ Cleanup merged
│   │   └── validate-commit.sh       # ✅ Commit validation
│   ├── dev.sh                       # ✅ Start dev environment
│   ├── prod.sh                      # ✅ Start production
│   ├── logs.sh                      # ✅ View container logs
│   ├── health.sh                    # ✅ Health checks
│   ├── reset.sh                     # ✅ Reset environment
│   ├── ci-checks.sh                 # ✅ CI quality checks
│   ├── check-format.sh              # ✅ Format check
│   ├── check-types.sh               # ✅ Type check
│   ├── lint-all.sh                  # ✅ Lint all
│   └── generate-secrets.sh          # ⚠️ Unused? (проверить)
│
├── 📦 apps/
│   ├── backend/
│   │   ├── src/database/
│   │   │   ├── README.md            # ✅ Database docs
│   │   │   ├── migrations/          # ✅ DB migrations
│   │   │   └── scripts/
│   │   │       └── verify-migrations.sh  # ✅ Migration verification
│   │   └── README.md                # ✅ Backend docs
│   └── frontend/
│       └── README.md                # ✅ Frontend docs
│
└── 📦 packages/
    └── shared/
        └── (no README needed)
```

---

## ✅ Что исправлено

### 1. ❌ Убрана проверка PR description (минимум 20 символов)

```yaml
# .github/workflows/branch-protection.yml
# Удален job: validate-pr-description
```

### 2. ✨ Улучшены package.json (все 4 файла)

```json
// Теперь команды сгруппированы с визуальными разделителями:
"scripts": {
  "// Development": "─────────────────────────────────────",
  "dev": "...",

  "// Build & Clean": "─────────────────────────────────────",
  "build": "...",

  "// Code Quality": "─────────────────────────────────────",
  "lint": "...",
  ...
}
```

**Улучшено в:**

- ✅ `/package.json` (root)
- ✅ `/apps/backend/package.json`
- ✅ `/apps/frontend/package.json`
- ✅ `/packages/shared/package.json`

### 3. 📚 Созданы справочные документы

- ✅ `REPOSITORY_STRUCTURE.md` - Детальная структура
- ✅ `FILES_REFERENCE.md` - Быстрая справка (этот файл)

---

## 📝 Рекомендации по скриптам

### ✅ Точно нужны (оставить)

**Docker операции:**

- `dev.sh` - Запуск dev окружения
- `prod.sh` - Запуск production
- `logs.sh` - Просмотр логов
- `health.sh` - Health checks
- `reset.sh` - Сброс окружения

**Git helpers:**

- `git/new-feature.sh` - Создание feature ветки
- `git/sync-develop.sh` - Синхронизация с develop
- `git/cleanup-branches.sh` - Очистка веток
- `git/validate-commit.sh` - Валидация коммитов

**CI/Quality:**

- `ci-checks.sh` - CI проверки
- `check-format.sh` - Проверка форматирования
- `check-types.sh` - Проверка типов
- `lint-all.sh` - Линтинг всех пакетов

### ⚠️ Проверить

**generate-secrets.sh:**

```bash
# Посмотреть что делает:
cat scripts/generate-secrets.sh

# Если используется - оставить
# Если нет - удалить
```

---

## 🎯 Как использовать package.json

### Root package.json

**Development:**

```bash
pnpm dev              # Start dev environment
pnpm down             # Stop containers
pnpm restart          # Restart environment
```

**Code Quality:**

```bash
pnpm lint             # Lint all
pnpm typecheck        # Type check all
pnpm format           # Format all
pnpm quality          # All checks
```

**Database:**

```bash
pnpm db:migrate       # Run migrations
pnpm db:seed          # Run seeds
pnpm db:psql          # Connect to DB
```

**Git:**

```bash
pnpm git:feature 123 my-feature  # Create feature branch
pnpm git:sync                     # Sync with develop
pnpm git:cleanup                  # Cleanup branches
```

### Apps package.json

**Backend:**

```bash
cd apps/backend
pnpm dev              # Start with hot reload
pnpm test             # Run tests
pnpm test:e2e         # E2E tests
pnpm migration:create # Create migration
```

**Frontend:**

```bash
cd apps/frontend
pnpm dev              # Start Vite dev server
pnpm build            # Build for production
pnpm preview          # Preview build
```

---

## 📖 Где искать информацию

### Я новый разработчик

```
1. README.md              ← Старт здесь
2. CONTRIBUTING.md        ← Как начать работать
3. GIT_WORKFLOW.md        ← Git процесс
```

### Я работаю с backend

```
apps/backend/README.md               ← Backend API
apps/backend/src/database/README.md  ← Database
MIGRATION_GUIDE.md                   ← Миграции
```

### Я настраиваю проект

```
SETUP_GITHUB.md           ← GitHub setup
docker-compose*.yml       ← Docker setup
.github/workflows/        ← CI/CD
```

### Я maintainer

```
REPOSITORY_STRUCTURE.md   ← Детальная структура
FILES_REFERENCE.md        ← Эта справка
GIT_WORKFLOW.md           ← Git процесс
```

---

## 🔄 Итоговые рекомендации

### ✅ Текущая структура: ОТЛИЧНО

Ваша структура оптимальна:

- Не перегружена
- Вся важная информация на месте
- Легко ориентироваться
- Хорошо организована

### 📝 TODO (опционально)

1. **Обновить главный README.md**
   - Описание проекта
   - Quick start
   - Tech stack
   - Ссылки на docs

2. **Проверить generate-secrets.sh**
   - Используется ли?
   - Если нет - удалить

3. **Опционально: Вынести SETUP_GITHUB.md в Wiki**
   - Это одноразовая инструкция
   - Не нужна каждый день

### 🚫 НЕ делать

- ❌ Не создавать docs/ папку (пока не нужна)
- ❌ Не перемещать файлы без причины
- ❌ Не добавлять CHANGELOG.md (используй GitHub Releases)
- ❌ Не создавать TODO.md (используй GitHub Issues)

---

## 💡 Быстрые ответы

**Q: Где Git процесс?** A: `GIT_WORKFLOW.md`

**Q: Как создать feature ветку?** A: `pnpm git:feature 123 my-feature`

**Q: Где CI/CD конфиги?** A: `.github/workflows/`

**Q: Как запустить миграции?** A: `pnpm db:migrate` или см. `MIGRATION_GUIDE.md`

**Q: Где описание проекта?** A: `README.md` (TODO: обновить)

**Q: Какие файлы не в Git?** A: Смотри `.gitignore`

**Q: Нужен ли SETUP_GITHUB.md в репе?** A: Можно вынести в Wiki, это одноразовая инструкция

---

**Нужна помощь?** Смотри соответствующий .md файл или создай Issue.

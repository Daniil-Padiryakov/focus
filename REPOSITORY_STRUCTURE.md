# Repository Structure Guide

## 📂 Файлы и их назначение

### Используются Git/GitHub напрямую

Эти файлы автоматически используются Git или GitHub:

#### Git

```
.gitignore              # Игнорируемые файлы (используется Git)
.gitattributes          # Настройки Git (опционально)
```

#### GitHub Actions

```
.github/
├── workflows/          # CI/CD пайплайны (используется GitHub)
│   ├── ci.yml
│   ├── code-quality.yml
│   ├── branch-protection.yml
│   └── auto-label.yml
├── PULL_REQUEST_TEMPLATE.md    # Шаблон PR (используется GitHub)
├── ISSUE_TEMPLATE/             # Шаблоны Issues (используется GitHub)
│   ├── bug_report.yml
│   ├── feature_request.yml
│   └── config.yml
├── CODEOWNERS          # Code review rules (используется GitHub)
└── labels.json         # Метки для импорта (референс для setup)
```

#### Husky / Git Hooks

```
.husky/                 # Git hooks (используется Git через Husky)
├── pre-commit          # Запускается перед коммитом
├── commit-msg          # Валидация commit message
└── pre-push            # Запускается перед push
```

---

### Документация для разработчиков

Эти файлы НЕ используются автоматически, но важны для команды:

#### Основная документация (держать в репе)

```
README.md               # Главная страница проекта
CONTRIBUTING.md         # Краткий гайд для contributors (ВАЖНО!)
```

#### Детальные гайды (держать в репе)

```
GIT_WORKFLOW.md         # Детальный Git процесс
MIGRATION_GUIDE.md      # Работа с миграциями БД
```

#### Setup инструкции (можно вынести в Wiki)

```
SETUP_GITHUB.md         # Настройка GitHub репозитория (одноразовая задача)
```

#### Package-specific README (держать в репе)

```
apps/backend/README.md          # Backend документация
apps/frontend/README.md         # Frontend документация
apps/backend/src/database/README.md  # Database документация
```

---

## 💡 Рекомендации

### ✅ Держать в репозитории

**Критически важные документы:**

- `README.md` - Обязательно!
- `CONTRIBUTING.md` - Обязательно!
- `.github/` - Всё, что там есть
- Package-specific README - Для каждого package

**Важные гайды:**

- `GIT_WORKFLOW.md` - Если у вас сложный Git процесс
- `MIGRATION_GUIDE.md` - Если есть database

**Почему держать в репе:**

1. ✅ Версионируется вместе с кодом
2. ✅ Доступно offline
3. ✅ Можно ревьюить через PR
4. ✅ Автоматически на GitHub

### 🤔 Опционально - можно вынести

**В GitHub Wiki:**

- `SETUP_GITHUB.md` - Одноразовая setup инструкция
- Детальные tutorials
- Архитектурные диаграммы
- Onboarding guides

**В отдельную документацию (docs сайт):**

- API documentation
- User guides
- Deployment guides
- Troubleshooting

**Почему вынести:**

1. Не загромождает корень репо
2. Легче поддерживать большие документы
3. Можно добавить поиск
4. Лучше для non-technical пользователей

### ❌ НЕ держать в репозитории

**Автогенерируемые файлы:**

```
CHANGELOG.md            # Автогенерируется из commits
API_DOCS.md             # Генерируется из кода
```

**Временные/локальные:**

```
NOTES.md
TODO.md                 # Используйте Issues/Projects
TEMP_*.md
```

**Слишком детальные:**

```
DETAILED_ARCHITECTURE.md  # → Wiki
DEPLOYMENT_PLAYBOOK.md    # → Wiki или отдельный docs repo
```

---

## 📊 Рекомендуемая структура

### Минимальная (для маленьких проектов)

```
.
├── .github/
│   ├── workflows/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── README.md           # Главный документ
├── CONTRIBUTING.md     # Как contribute
└── .gitignore
```

### Средняя (для большинства проектов) ← **ВЫ ЗДЕСЬ**

```
.
├── .github/
│   ├── workflows/      # CI/CD
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   └── labels.json
├── README.md
├── CONTRIBUTING.md     # Краткий гайд
├── GIT_WORKFLOW.md     # Детальный Git процесс
├── MIGRATION_GUIDE.md  # Если есть БД
└── apps/*/README.md    # Package-specific
```

### Большая (для enterprise проектов)

```
.
├── .github/            # Всё для GitHub
├── docs/              # Отдельная папка для документации
│   ├── architecture/
│   ├── api/
│   ├── guides/
│   └── deployment/
├── README.md
├── CONTRIBUTING.md
└── apps/*/README.md
```

---

## 🎯 Текущая структура вашего проекта

### Что у вас есть сейчас

```
✅ README.md                    # Главный (TODO: обновить)
✅ CONTRIBUTING.md              # Краткий гайд (хорошо!)
✅ GIT_WORKFLOW.md              # Детальный Git (отлично!)
✅ MIGRATION_GUIDE.md           # Database guide (отлично!)
✅ REPOSITORY_STRUCTURE.md      # Этот файл
⚠️  SETUP_GITHUB.md             # Можно вынести в Wiki

✅ .github/workflows/           # CI/CD (отлично!)
✅ .github/PULL_REQUEST_TEMPLATE.md
✅ .github/ISSUE_TEMPLATE/
✅ .github/labels.json

✅ apps/backend/README.md
✅ apps/backend/src/database/README.md
✅ apps/frontend/README.md
```

### Рекомендации

#### ✅ Оставить как есть (хорошая структура!)

- `README.md`
- `CONTRIBUTING.md`
- `GIT_WORKFLOW.md`
- `MIGRATION_GUIDE.md`
- `REPOSITORY_STRUCTURE.md`
- Всё в `.github/`
- Package README

#### 🤔 Опционально вынести в Wiki (если хотите упростить)

- `SETUP_GITHUB.md` - Это одноразовая инструкция для setup

#### 📝 TODO: Обновить главный README

Сейчас в корне должен быть обновленный `README.md` с:

- Описанием проекта
- Quick start
- Features
- Tech stack
- Ссылками на CONTRIBUTING.md и GIT_WORKFLOW.md

---

## 📖 Где искать информацию

### Для новых contributors

```
1. README.md              # Что это за проект
2. CONTRIBUTING.md        # Как начать работать
3. GIT_WORKFLOW.md        # Git процесс (детально)
```

### Для работы с кодом

```
apps/backend/README.md          # Backend
apps/frontend/README.md         # Frontend
MIGRATION_GUIDE.md              # Database
```

### Для DevOps/Setup

```
SETUP_GITHUB.md                 # GitHub setup
docker-compose*.yml             # Docker setup
.github/workflows/              # CI/CD
```

---

## 🔄 Альтернативный подход: docs/

Если проектрастет, можно переместить гайды в `docs/`:

```
docs/
├── getting-started/
│   ├── setup.md
│   └── contributing.md
├── development/
│   ├── git-workflow.md
│   ├── code-style.md
│   └── testing.md
├── database/
│   ├── migrations.md
│   └── schema.md
├── deployment/
│   └── production.md
└── architecture/
    └── overview.md
```

А в корне оставить только:

```
README.md           # Index с ссылками на docs/
CONTRIBUTING.md     # Краткий гайд + ссылки
```

---

## 💭 Итоговые рекомендации для вашего проекта

### Текущая структура: ✅ ХОРОШАЯ

Ваша текущая структура отличная для проекта такого размера:

- Не перегружена
- Вся важная информация на месте
- Легко найти что нужно
- GitHub автоматически использует templates

### Если хотите упростить:

**Опция 1: Минимальная очистка**

```bash
# Переместить SETUP_GITHUB.md в Wiki
# Всё остальное оставить
```

**Опция 2: Создать docs/ папку** (для больших проектов)

```bash
mkdir -p docs
mv GIT_WORKFLOW.md docs/git-workflow.md
mv MIGRATION_GUIDE.md docs/migrations.md
mv SETUP_GITHUB.md docs/github-setup.md
# Обновить ссылки в CONTRIBUTING.md
```

### Рекомендация: **Оставить как есть!**

Для проекта такого размера (3 packages, ~10 файлов MD) текущая структура оптимальна:

- ✅ Легко ориентироваться
- ✅ Нет overengineering
- ✅ Масштабируемо на будущее
- ✅ Следует best practices

---

## 📚 Ресурсы

- [GitHub Docs - About READMEs](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [Contributing Guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors)
- [Issue Templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)

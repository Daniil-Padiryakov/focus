# Database Migrations

Этот директорий содержит миграции базы данных и seeds для проекта Focus.

## Структура

```
database/
├── migrations/          # Миграции базы данных (Knex.js)
├── seeds/              # Seed данные для development
├── scripts/            # Utility скрипты
├── knexfile.ts         # Конфигурация Knex.js
└── README.md           # Эта документация
```

## Миграции

### Порядок выполнения

Миграции выполняются в порядке их timestamp:

1. **20251025000000_init_schema.ts** - Инициализация схемы и расширений
2. **20251025143703_create_users_table.ts** - Таблица пользователей
3. **20251025145201_create_pomodoros_table.ts** - Таблица pomodoro сессий
4. **20251026160705_add_performance_indexes.ts** - Индексы производительности
5. **20251026160957_add_data_integrity_constraints.ts** - Проверки целостности

### Важные принципы

#### Самодостаточность миграций

Миграции **НЕ ДОЛЖНЫ** зависеть от внешних скриптов инициализации. Первая миграция (`init_schema`) создает все необходимые схемы и функции.

#### Идемпотентность

Все миграции используют:

- `CREATE ... IF NOT EXISTS`
- `DROP ... IF EXISTS`
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` (где возможно)

#### Откат (Rollback)

Каждая миграция имеет функцию `down()` для отката изменений.

## Команды

### Development (Docker)

```bash
# Запустить все pending миграции
pnpm db:migrate

# Создать новую миграцию
pnpm db:migrate:make migration_name

# Откатить последнюю миграцию
pnpm db:migrate:rollback

# Посмотреть статус миграций
pnpm db:migrate:status

# Запустить seeds
pnpm db:seed

# Создать новый seed
pnpm db:seed:make seed_name
```

### Прямые команды (внутри контейнера или локально)

```bash
# Из корня проекта
pnpm --filter @focus/backend migration:run
pnpm --filter @focus/backend migration:rollback
pnpm --filter @focus/backend migration:create migration_name

# Или из apps/backend
cd apps/backend
pnpm migration:run
pnpm migration:rollback
pnpm migration:create migration_name
```

## CI/CD

В CI/CD окружении миграции запускаются автоматически:

```yaml
- name: Run database migrations
  run: pnpm --filter @focus/backend migration:run
  env:
    NODE_ENV: test
    DATABASE_HOST: localhost
    DATABASE_USER: test_user
    DATABASE_PASSWORD: test_password
    DATABASE_NAME: test_db
```

### Важно для CI

1. PostgreSQL сервис должен иметь права на создание расширений
2. Миграция `init_schema` создает все необходимые расширения
3. Не нужны дополнительные скрипты инициализации

## Тестирование миграций

### Автоматическая проверка

```bash
# Запустить скрипт проверки миграций
./apps/backend/src/database/scripts/verify-migrations.sh
```

Этот скрипт:

1. Создает временную тестовую БД
2. Применяет все миграции (up)
3. Откатывает все миграции (down)
4. Применяет повторно (тест идемпотентности)
5. Удаляет тестовую БД

### Ручная проверка

```bash
# 1. Создать тестовую БД
createdb migration_test

# 2. Применить миграции
DATABASE_NAME=migration_test pnpm --filter @focus/backend migration:run

# 3. Проверить схему
psql migration_test -c "\dt"  # Список таблиц
psql migration_test -c "\di"  # Список индексов
psql migration_test -c "\df focus.*"  # Список функций в схеме focus

# 4. Откатить
DATABASE_NAME=migration_test pnpm --filter @focus/backend migration:rollback

# 5. Удалить тестовую БД
dropdb migration_test
```

## Создание новой миграции

### 1. Создать файл миграции

```bash
pnpm db:migrate:make descriptive_name
```

### 2. Шаблон миграции

```typescript
import { Knex } from 'knex';

/**
 * Migration: Descriptive name
 *
 * Description:
 * - What this migration does
 * - Why it's needed
 *
 * Dependencies: List any table dependencies
 * Breaking: Yes/No
 * Rollback: Safe/Risky
 */

export async function up(knex: Knex): Promise<void> {
  // Your migration logic
  await knex.schema.createTable('table_name', (table) => {
    // Define schema
  });

  console.log('✅ Migration applied');
}

export async function down(knex: Knex): Promise<void> {
  // Rollback logic
  await knex.schema.dropTableIfExists('table_name');

  console.log('✅ Migration rolled back');
}
```

### 3. Best Practices

#### DO ✅

- Используйте транзакции где возможно
- Добавляйте индексы для внешних ключей
- Используйте комментарии для колонок
- Добавляйте CHECK constraints для валидации
- Тестируйте миграции локально перед commit

#### DON'T ❌

- Не изменяйте уже примененные миграции
- Не используйте `ALTER TABLE ... DROP COLUMN` без rollback плана
- Не удаляйте данные без бэкапа
- Не создавайте циклические зависимости

## Окружения

### Development

- База: `focus_dev`
- Пользователь: `postgres`
- SSL: disabled
- Debug: enabled
- Миграции: `.ts` файлы
- Seeds: enabled

### Test

- База: `focus_test` или `test_db` (CI)
- Пользователь: `postgres` или `test_user` (CI)
- SSL: disabled
- Debug: disabled
- Миграции: `.ts` файлы
- Seeds: test fixtures

### Production

- База: из переменных окружения
- Пользователь: из переменных окружения
- SSL: **REQUIRED**
- Debug: disabled
- Миграции: `.js` файлы (compiled)
- Seeds: **disabled**

## Troubleshooting

### "schema does not exist" в CI

✅ **Решено**: Миграция `init_schema` создает схему автоматически

### "permission denied to create extension"

Убедитесь что пользователь БД имеет права суперпользователя или используйте:

```sql
GRANT CREATE ON DATABASE dbname TO username;
```

### Миграция зависла

```bash
# Проверить активные подключения
psql -c "SELECT * FROM pg_stat_activity WHERE datname = 'focus_dev';"

# Завершить зависшие подключения
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'focus_dev' AND pid <> pg_backend_pid();"
```

### Откатить все миграции

```bash
# ОСТОРОЖНО: Удалит все данные!
pnpm db:migrate:rollback --all
```

## Schema Diagram

```
users (user_id, email, password_hash, created_at, updated_at, last_login_at, deleted_at)
  |
  └─── pomodoros (pomodoro_id, user_id↑, planned_duration, actual_duration, start_time, end_time, created_at, updated_at)
```

## Дополнительно

- Функции в схеме `focus`:
  - `trigger_set_timestamp()` - Автоматическое обновление `updated_at`

- Расширения PostgreSQL:
  - `uuid-ossp` - Генерация UUID
  - `pg_trgm` - Trigram для полнотекстового поиска
  - `btree_gin` - GIN индексы для производительности

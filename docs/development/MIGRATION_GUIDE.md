# Database Migration Guide

## Quick Start

```bash
# Development
pnpm db:migrate              # Run all pending migrations
pnpm db:migrate:status       # Check migration status
pnpm db:migrate:rollback     # Rollback last migration

# Create new migration
pnpm db:migrate:make migration_name
```

## Architecture

### Migration Flow

```
┌─────────────────────────────────────────────────┐
│  Environment: Docker / CI / Production          │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Migration: 20251025000000_init_schema.ts       │
│  - Create schema 'focus'                        │
│  - Enable extensions (uuid-ossp, pg_trgm, etc)  │
│  - Create utility functions                     │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Migration: 20251025143703_create_users.ts      │
│  - Create users table                           │
│  - Add triggers using focus.trigger_*           │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Migration: 20251025145201_create_pomodoros.ts  │
│  - Create pomodoros table                       │
│  - Add foreign keys to users                    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Migration: Additional indexes and constraints  │
└─────────────────────────────────────────────────┘
```

### Key Principles

1. **Self-Contained Migrations**
   - Миграции НЕ зависят от внешних SQL скриптов
   - Первая миграция создает все необходимые схемы
   - Работают в любом окружении (dev, test, prod, CI)

2. **Idempotent Operations**
   - Используем `IF NOT EXISTS` / `IF EXISTS`
   - Можно запускать миграции повторно без ошибок

3. **Rollback Support**
   - Каждая миграция имеет функцию `down()`
   - Безопасный откат изменений

## Environments

### Development (Docker)

```yaml
# docker-compose.dev.yml
postgres:
  # Init script выполняется при первом запуске
  volumes:
    - ./docker/postgres/01-init.sql:/docker-entrypoint-initdb.d/01-init.sql
```

Миграции запускаются через:

```bash
pnpm db:migrate
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
services:
  postgres:
    image: postgres:14-alpine
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: test_db
```

Миграции запускаются автоматически:

```yaml
- name: Run database migrations
  run: pnpm --filter @focus/backend migration:run
```

**Важно**: В CI нет Docker init скриптов, поэтому миграция `init_schema` критична!

### Production

```bash
# Перед деплоем - проверить миграции
pnpm --filter @focus/backend migration:status

# Применить миграции
NODE_ENV=production pnpm --filter @focus/backend migration:run

# Проверить результат
NODE_ENV=production pnpm --filter @focus/backend migration:status
```

## Common Scenarios

### Creating a New Table

```typescript
// migration: 20250101000000_create_tasks.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.increments('task_id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('user')
      .onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('created_at');
  });

  // Add trigger for auto-updating updated_at
  await knex.raw(`
    CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION focus.trigger_set_timestamp();
  `);

  console.log('✅ Created tasks table');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks');
  await knex.schema.dropTableIfExists('tasks');
  console.log('✅ Dropped tasks table');
}
```

### Adding a Column

```typescript
// migration: 20250101000001_add_user_avatar.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('user', (table) => {
    table.string('avatar_url', 500).nullable().comment('User avatar URL');
  });
  console.log('✅ Added avatar_url to user');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('user', (table) => {
    table.dropColumn('avatar_url');
  });
  console.log('✅ Removed avatar_url from user');
}
```

### Adding Constraints

```typescript
// migration: 20250101000002_add_task_constraints.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Title length constraint
  await knex.raw(`
    ALTER TABLE tasks
      ADD CONSTRAINT check_title_length
        CHECK (char_length(title) >= 3 AND char_length(title) <= 255);
  `);

  console.log('✅ Added constraints to tasks');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE tasks DROP CONSTRAINT IF EXISTS check_title_length');
  console.log('✅ Removed constraints from tasks');
}
```

## Troubleshooting

### Error: "schema focus does not exist"

**Причина**: Миграция `init_schema` не была выполнена

**Решение**:

```bash
# Убедитесь что init_schema первая миграция
ls -la apps/backend/src/database/migrations/

# Должна быть:
# 20251025000000_init_schema.ts  <- Самая первая!
# 20251025143703_create_users_table.ts
# ...

# Запустите миграции
pnpm db:migrate
```

### Error: "migration locked"

**Причина**: Предыдущая миграция не завершилась

**Решение**:

```bash
# Разблокировать миграции
pnpm --filter @focus/backend migration:unlock

# Проверить статус
pnpm --filter @focus/backend migration:status
```

### Error: "relation already exists"

**Причина**: Миграция запущена повторно без отката

**Решение**:

```bash
# 1. Проверить что уже создано
psql -d focus_dev -c "\dt"  # Список таблиц

# 2. Откатить последнюю миграцию
pnpm db:migrate:rollback

# 3. Запустить заново
pnpm db:migrate
```

### CI fails with permission denied

**Причина**: PostgreSQL пользователь не имеет прав на создание расширений

**Решение в CI**:

```yaml
services:
  postgres:
    options: >-
      --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    # Используем роль postgres (суперпользователь)
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
```

Или создайте расширения вручную:

```yaml
- name: Setup PostgreSQL extensions
  run: |
    PGPASSWORD=postgres psql -h localhost -U postgres -d test_db <<-EOSQL
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      CREATE EXTENSION IF NOT EXISTS "btree_gin";
    EOSQL
```

## Best Practices

### ✅ DO

1. **Test migrations locally before committing**

   ```bash
   pnpm --filter @focus/backend migration:verify
   ```

2. **Add meaningful comments**

   ```typescript
   table.string('email').notNullable().comment('User email for authentication');
   ```

3. **Use transactions for data migrations**

   ```typescript
   await knex.transaction(async (trx) => {
     // Migration logic
   });
   ```

4. **Version control your migrations**
   - Never modify already-applied migrations
   - Create new migration for changes

### ❌ DON'T

1. **Don't drop columns without backup**

   ```typescript
   // Bad
   table.dropColumn('important_data');

   // Good - rename first, drop later
   table.renameColumn('important_data', 'old_important_data');
   ```

2. **Don't use hardcoded values**

   ```typescript
   // Bad
   .defaultTo('2024-01-01')

   // Good
   .defaultTo(knex.fn.now())
   ```

3. **Don't skip rollback functions**
   ```typescript
   // Always implement down()
   export async function down(knex: Knex): Promise<void> {
     // Rollback logic here
   }
   ```

## Monitoring

### Check Migration Status

```bash
# Local
pnpm db:migrate:status

# Production
NODE_ENV=production pnpm --filter @focus/backend migration:status
```

### Verify Database Schema

```bash
# Connect to database
pnpm db:psql:interactive

# Check tables
\dt

# Check schema
\dn

# Check functions
\df focus.*

# Check indexes
\di

# Check constraints
\d+ user
```

## Backup Strategy

### Before Production Migrations

```bash
# 1. Backup database
pnpm db:backup

# 2. Test on staging
DATABASE_NAME=focus_staging pnpm --filter @focus/backend migration:run

# 3. Verify staging
DATABASE_NAME=focus_staging psql -c "SELECT * FROM knex_migrations;"

# 4. Apply to production
NODE_ENV=production pnpm --filter @focus/backend migration:run

# 5. If something goes wrong
NODE_ENV=production pnpm --filter @focus/backend migration:rollback
pnpm db:restore backup-file.sql
```

## Additional Resources

- [Knex.js Documentation](https://knexjs.org/guide/migrations.html)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Database README](./apps/backend/src/database/README.md)

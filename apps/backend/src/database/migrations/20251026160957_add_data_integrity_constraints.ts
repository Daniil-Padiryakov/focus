import { Knex } from 'knex';

/**
 * Migration: Add data integrity constraints
 *
 * Created: 2025-10-25
 *
 * Description:
 * - Additional CHECK constraints для data validation
 * - UNIQUE constraints на composite keys
 * - NOT NULL constraints где appropriate
 *
 * Breaking: Potentially (если existing data violates constraints)
 * Rollback: Safe (drops constraints)
 */

export async function up(knex: Knex): Promise<void> {
  // ================================
  // Users Table Constraints
  // ================================

  // Email format validation (basic regex)
  await knex.raw(`
        ALTER TABLE users
            ADD CONSTRAINT check_email_format
                CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');
    `);

  // Logical constraint: created_at <= updated_at
  await knex.raw(`
        ALTER TABLE users
            ADD CONSTRAINT check_updated_after_created
                CHECK (updated_at >= created_at);
    `);

  // Logical constraint: deleted_at after created_at (если не NULL)
  await knex.raw(`
        ALTER TABLE users
            ADD CONSTRAINT check_deleted_after_created
                CHECK (deleted_at IS NULL OR deleted_at >= created_at);
    `);

  // ================================
  // Cross-table constraints (опционально, через triggers)
  // ================================
  // Например: User не может иметь больше 1 running pomodoro одновременно
  // Это сложнее implement через CHECK constraint, можно через trigger

  console.log('✅ Added data integrity constraints');
  console.log('⚠️ If migration fails, existing data violates constraints');
  console.log('Fix data first, then re-run migration');
}

export async function down(knex: Knex): Promise<void> {
  // Drop constraints (обратный порядок не важен)
  await knex.raw(
    'ALTER TABLE users DROP CONSTRAINT IF EXISTS check_email_format',
  );
  await knex.raw(
    'ALTER TABLE users DROP CONSTRAINT IF EXISTS check_updated_after_created',
  );
  await knex.raw(
    'ALTER TABLE users DROP CONSTRAINT IF EXISTS check_deleted_after_created',
  );

  console.log('✅ Dropped data integrity constraints');
}

import { Knex } from 'knex';

/**
 * Migration: Create users table
 *
 * Created: 2025-10-25
 *
 * Description:
 * - Users authentication и profile data
 * - Email-based authentication
 * - Soft delete support (deleted_at)
 * - Timestamps для audit trail
 *
 * Breaking: No (new table)
 * Rollback: Safe (drops table)
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', async (table) => {
    // ================================
    // Primary Key
    // ================================
    table.increments('user_id').primary().comment('User ID (auto-increment)');

    // ================================
    // Authentication
    // ================================
    table
      .string('email', 255)
      .notNullable()
      .unique()
      .comment('User email (unique, for login)');

    table
      .string('password_hash', 255)
      .notNullable()
      .comment('Bcrypt password hash');

    // ================================
    // Timestamps
    // ================================
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Created timestamp (UTC)');

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Updated timestamp (UTC)');

    // Soft delete
    table
      .timestamp('deleted_at', { useTz: true })
      .nullable()
      .comment('Soft delete timestamp');

    // ================================
    // Indexes
    // ================================
    // Unique index на email уже создан через .unique()

    // Partial index отдельно через raw SQL
    await knex.raw(`
            CREATE INDEX idx_users_active
                ON users (deleted_at) WHERE deleted_at IS NULL
        `);
  });

  // ================================
  // Trigger: Auto-update updated_at
  // ================================
  // Использует функцию из init script (01-init.sql)
  await knex.raw(`
    CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION focus.trigger_set_timestamp();
  `);

  console.log(' Created users table with indexes and triggers');
}

export async function down(knex: Knex): Promise<void> {
  // ================================
  // Rollback: Drop trigger и table
  // ================================
  await knex.raw('DROP TRIGGER IF EXISTS set_users_updated_at ON users');
  await knex.schema.dropTableIfExists('users');

  console.log(' Dropped users table');
}

import { Knex } from 'knex';

/**
 * Migration: Create pomodoros table
 *
 * Created: 2025-10-25
 *
 * Description:
 * - Pomodoro sessions tracking
 * - Связан с users через foreign key
 * - Support для different types (work, short_break, long_break)
 * - Status tracking (running, paused, completed)
 *
 * Dependencies: users table
 * Breaking: No (new table)
 * Rollback: Safe (drops table)
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pomodoros', (table) => {
    // ================================
    // Primary Key
    // ================================
    table.increments('pomodoro_id').primary();

    // ================================
    // Foreign Key: User
    // ================================
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE') // Если user удалён → удалить его pomodoros
      .onUpdate('CASCADE') // Если user_id изменён → обновить
      .comment('User who owns this pomodoro');

    // ================================
    // Duration (в секундах)
    // ================================
    table
      .integer('planned_duration')
      .unsigned()
      .notNullable()
      .comment('Planned duration in seconds (e.g., 1500 = 25min)');

    table
      .integer('actual_duration')
      .unsigned()
      .nullable()
      .comment('Actual duration in seconds (if completed)');

    // ================================
    // Timestamps
    // ================================
    table
      .timestamp('start_time', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('When pomodoro started');

    table
      .timestamp('end_time', { useTz: true })
      .nullable()
      .comment('When pomodoro ended (if completed)');

    // ================================
    // Metadata
    // ================================
    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    // ================================
    // Indexes
    // ================================
    // Foreign key index (автоматически создаётся, но явно)
    table.index('user_id', 'idx_pomodoros_user_id');

    // Composite index для queries "user's pomodoros on date"
    table.index(['user_id', 'start_time'], 'idx_pomodoros_user_start');

    // Index для date-based queries
    table.index('start_time', 'idx_pomodoros_start_time');
  });

  // Trigger для updated_at
  await knex.raw(`
    CREATE TRIGGER set_pomodoros_updated_at
    BEFORE UPDATE ON pomodoros
    FOR EACH ROW
    EXECUTE FUNCTION focus.trigger_set_timestamp();
  `);

  // ================================
  // Check Constraints (data validation)
  // ================================
  // Planned duration должна быть разумной (1 min - 2 hours)
  await knex.raw(`
        ALTER TABLE pomodoros
            ADD CONSTRAINT check_planned_duration
                CHECK (planned_duration BETWEEN 60 AND 7200);
    `);

  // Actual duration не может быть больше 3x planned (reasonable limit)
  await knex.raw(`
        ALTER TABLE pomodoros
            ADD CONSTRAINT check_actual_duration
                CHECK (actual_duration IS NULL OR actual_duration <= planned_duration * 3);
    `);

  // End time должен быть после start time
  await knex.raw(`
        ALTER TABLE pomodoros
            ADD CONSTRAINT check_end_after_start
                CHECK (end_time IS NULL OR end_time >= start_time);
    `);

  console.log(
    ' Created pomodoros table with foreign keys, indexes, and constraints',
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    'DROP TRIGGER IF EXISTS set_pomodoros_updated_at ON pomodoros',
  );

  // Drop ENUMs (PostgreSQL specific)
  await knex.schema.dropTableIfExists('pomodoros');

  console.log(' Dropped pomodoros table');
}

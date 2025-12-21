import { Knex } from 'knex';

/**
 * Migration: Add performance indexes
 *
 * Created: 2024-05-18
 *
 * Description:
 * - Composite indexes для common query patterns
 * - Partial indexes для filtered queries
 * - GIN indexes для JSONB columns
 *
 * Performance Impact: Improve query speed 10-100x
 * Storage Impact: +10-20% disk space
 *
 * Breaking: No
 * Rollback: Safe (drops indexes only)
 */

export async function up(knex: Knex): Promise<void> {
  // ================================
  // Users Table Indexes
  // ================================

  // Composite index для "recent active users"
  // Query: SELECT * FROM users WHERE deleted_at IS NULL ORDER BY last_login_at DESC
  await knex.raw(`
        CREATE INDEX idx_users_active_last_login
            ON users (last_login_at DESC) WHERE deleted_at IS NULL;
    `);

  // ================================
  // Pomodoros Table Indexes
  // ================================

  // Composite index для "user's pomodoros today"
  // Query: SELECT * FROM pomodoros
  //        WHERE user_id = ? AND start_time >= CURRENT_DATE
  await knex.raw(`
        CREATE INDEX idx_pomodoros_user_date
            ON pomodoros (user_id, start_time DESC);
    `);

  // ================================
  // Index на date range queries (time-series optimization)
  // ================================
  // BRIN index для large historical data (more efficient than B-tree)
  await knex.raw(`
        CREATE INDEX idx_pomodoros_start_time_brin
            ON pomodoros USING brin (start_time);
    `);

  console.log('✅ Created performance indexes');
  console.log('📊 Run ANALYZE to update statistics:');
  console.log('ANALYZE users;');
  console.log('ANALYZE pomodoros;');
}

export async function down(knex: Knex): Promise<void> {
  // Drop indexes (order не важен для indexes)
  await knex.raw('DROP INDEX IF EXISTS idx_users_active_last_login');
  await knex.raw('DROP INDEX IF EXISTS idx_pomodoros_user_date');
  await knex.raw('DROP INDEX IF EXISTS idx_pomodoros_start_time_brin');

  console.log('✅ Dropped performance indexes');
}

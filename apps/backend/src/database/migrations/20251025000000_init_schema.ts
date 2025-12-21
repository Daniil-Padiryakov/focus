import { Knex } from 'knex';

/**
 * Migration: Initialize database schema
 *
 * Created: 2025-10-25
 *
 * Description:
 * - Create focus schema for namespacing
 * - Create utility functions (trigger_set_timestamp)
 * - Enable required PostgreSQL extensions
 * - This migration MUST run first (timestamp: 00000)
 *
 * Dependencies: None
 * Breaking: No (initialization only)
 * Rollback: Safe (drops schema and functions)
 */

export async function up(knex: Knex): Promise<void> {
  console.log('🔧 Initializing database schema and extensions...');

  // ================================
  // Enable PostgreSQL Extensions
  // ================================
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  console.log('  ✓ Enabled uuid-ossp extension');

  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
  console.log('  ✓ Enabled pg_trgm extension (trigram for full-text search)');

  await knex.raw('CREATE EXTENSION IF NOT EXISTS "btree_gin"');
  console.log('  ✓ Enabled btree_gin extension (GIN indexes)');

  // ================================
  // Create focus schema
  // ================================
  await knex.raw('CREATE SCHEMA IF NOT EXISTS focus');
  console.log('  ✓ Created focus schema');

  // ================================
  // Set default privileges for focus schema
  // ================================
  // Get current database user
  const result = await knex.raw('SELECT current_user');
  const currentUser = result.rows[0].current_user;

  await knex.raw(`
    ALTER DEFAULT PRIVILEGES IN SCHEMA focus
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${currentUser}
  `);
  console.log(`  ✓ Set default privileges for ${currentUser}`);

  // ================================
  // Create utility functions
  // ================================

  // Function: Auto-update updated_at timestamp
  await knex.raw(`
    CREATE OR REPLACE FUNCTION focus.trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.raw(`
    COMMENT ON FUNCTION focus.trigger_set_timestamp()
    IS 'Automatically updates updated_at timestamp on UPDATE operations';
  `);
  console.log('  ✓ Created trigger_set_timestamp() function');

  console.log('✅ Database schema initialization completed');
}

export async function down(knex: Knex): Promise<void> {
  console.log('🔧 Rolling back database schema initialization...');

  // ================================
  // Drop functions (must drop before schema)
  // ================================
  await knex.raw(
    'DROP FUNCTION IF EXISTS focus.trigger_set_timestamp() CASCADE',
  );
  console.log('  ✓ Dropped trigger_set_timestamp() function');

  // ================================
  // Drop schema
  // ================================
  await knex.raw('DROP SCHEMA IF EXISTS focus CASCADE');
  console.log('  ✓ Dropped focus schema');

  // Note: We don't drop extensions as they might be used by other databases
  // Extensions are safe to keep installed

  console.log('✅ Schema rollback completed');
}

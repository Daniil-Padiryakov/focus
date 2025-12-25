import type { Knex } from 'knex';

/**
 * Migration: Create tokens table
 *
 * Created: 2025-12-22
 *
 * Description:
 * - Auth refresh tokens
 *
 * Breaking: No (new table)
 * Rollback: Safe (drops table)
 */

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tokens', async (table) => {
    // ================================
    // Primary Key
    // ================================
    table.increments('token_id').primary().comment('Token ID (auto-increment)');

    // ================================
    // Foreign Key: User
    // ================================
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE') // Если user удалён → удалить его tokens
      .onUpdate('CASCADE') // Если user_id изменён → обновить
      .comment('User who owns this token');

    // ================================
    // Refresh Token
    // ================================
    table
      .string('refresh_token_hash', 64)
      .notNullable()
      .comment('User refresh token');

    // ================================
    // Timestamps
    // ================================
    table
      .timestamp('expires_at', { useTz: true })
      .notNullable()
      .comment('When refresh token expires timestamp (UTC)');

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
      .comment('Created timestamp (UTC)');

    // ================================
    // Indexes
    // ================================
    // Foreign key index (автоматически создаётся, но явно)
    table.index('user_id', 'idx_tokens_user_id');

    // Index for find user's tokens
    table.index('refresh_token_hash', 'idx_tokens_refresh_token_hash');
  });

  console.log(' Created tokens table with foreign keys, indexes');
}

export async function down(knex: Knex): Promise<void> {
  // Drop ENUMs (PostgreSQL specific)
  await knex.schema.dropTableIfExists('tokens');

  console.log(' Dropped tokens table');
}

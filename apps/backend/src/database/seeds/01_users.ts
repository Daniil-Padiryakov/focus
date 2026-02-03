import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Demo user для development
 *
 * Creates:
 * - 2 demo user с hashed passwords
 * - Different user profiles для testing
 *
 * Password для всех: "password123"
 */
export async function seed(knex: Knex): Promise<void> {
  // ================================
  // Clear existing data (только в dev!)
  // ================================
  await knex('user').del();

  // ================================
  // Hash password
  // ================================
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  // ================================
  // Insert demo user
  // ================================
  await knex('user').insert([
    {
      email: 'demo@example.com',
      password_hash: passwordHash,
    },
    {
      email: 'admin@example.com',
      password_hash: passwordHash,
    },
  ]);

  console.log(' Seeded 2 demo user (password: "password123")');
}

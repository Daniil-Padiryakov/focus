import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Demo users для development
 *
 * Creates:
 * - 2 demo users с hashed passwords
 * - Different user profiles для testing
 *
 * Password для всех: "password123"
 */
export async function seed(knex: Knex): Promise<void> {
  // ================================
  // Clear existing data (только в dev!)
  // ================================
  await knex('users').del();

  // ================================
  // Hash password
  // ================================
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('password123', saltRounds);

  // ================================
  // Insert demo users
  // ================================
  await knex('users').insert([
    {
      email: 'demo@example.com',
      password_hash: passwordHash,
    },
    {
      email: 'admin@example.com',
      password_hash: passwordHash,
    },
  ]);

  console.log(' Seeded 2 demo users (password: "password123")');
}

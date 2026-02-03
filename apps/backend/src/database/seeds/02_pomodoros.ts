import { Knex } from 'knex';

/**
 * Seed: Sample pomodoro sessions для development
 *
 * Creates:
 * - 10 pomodoro sessions для demo user
 * - Mix of work sessions и breaks
 * - Different statuses для testing
 */
export async function seed(knex: Knex): Promise<void> {
  // ================================
  // Clear existing data
  // ================================
  await knex('pomodoros').del();

  // ================================
  // Get demo user ID
  // ================================
  const demoUser: any = await knex('user')
    .where({ email: 'demo@example.com' })
    .first();

  if (!demoUser) {
    console.warn('Demo user not found, skipping pomodoros seed');
    return;
  }

  // ================================
  // Generate sample pomodoros (last 3 days)
  // ================================
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const pomodoros: any[] = [];

  // Day 1: Completed work cycle (4 pomodoros + breaks)
  const day1Start = new Date(threeDaysAgo);
  day1Start.setHours(9, 0, 0, 0);

  for (let i = 0; i < 4; i++) {
    // Work session
    const workStart = new Date(day1Start.getTime() + i * 35 * 60 * 1000);
    const workEnd = new Date(workStart.getTime() + 25 * 60 * 1000);

    pomodoros.push({
      user_id: demoUser.user_id,
      planned_duration: 25 * 60,
      actual_duration: 25 * 60,
      start_time: workStart,
      end_time: workEnd,
    });
  }

  // ================================
  // Insert all pomodoros
  // ================================
  await knex('pomodoros').insert(pomodoros);

  console.log(`Seeded ${pomodoros.length} pomodoro sessions for demo user`);
}

// @ts-nocheck
import knex, { Knex } from 'knex';
import knexConfig from './knexfile';

/**
 * Database Provider
 * Создаёт optimized Knex connection pool
 */

export class DatabaseProvider {
  private static instance: Knex | null = null;
  private static monitoringInterval: any = null;

  /**
   * Get Knex instance (singleton)
   */
  static async getConnection(): Promise<Knex> {
    if (!this.instance) {
      const environment = process.env.NODE_ENV || 'development';
      // @ts-ignore
      const config = knexConfig[environment];

      if (!config) {
        throw new Error(
          `❌ Knex config not found for environment: ${environment}`,
        );
      }

      this.instance = knex(config);

      // Verify connection
      await this.verifyConnection(this.instance);

      // Setup connection monitoring
      this.setupMonitoring(this.instance);
    }

    return this.instance;
  }

  /**
   * Verify database connection
   */
  private static async verifyConnection(knex: Knex): Promise<void> {
    try {
      await knex.raw('SELECT 1');
      console.log('✅ Database connection verified');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Setup connection pool monitoring
   */
  private static setupMonitoring(knex: Knex): void {
    if (process.env.NODE_ENV === 'development') {
      this.monitoringInterval = setInterval(() => {
        try {
          const pool = knex.client.pool;

          if (pool && typeof pool.numUsed === 'function') {
            console.log('📊 Connection Pool Stats:', {
              used: pool.numUsed(),
              free: pool.numFree(),
              pending: pool.numPendingAcquires(),
              min: pool.min,
              max: pool.max,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          // Не падаем если pool API изменился
          console.warn('⚠️  Failed to get pool stats:', error.message);
        }
      }, 60000);

      this.monitoringInterval.unref();
    }
  }

  /**
   * Graceful shutdown
   */

  static async close(): Promise<void> {
    // ✅ Останавливаем мониторинг
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.instance) {
      await this.instance.destroy();
      this.instance = null;
      console.log('✅ Database connection closed');
    }
  }
}

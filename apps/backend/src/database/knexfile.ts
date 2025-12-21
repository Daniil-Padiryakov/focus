// @ts-nocheck
import type { Knex } from 'knex';
import * as path from 'path';

/**
 * Knex Configuration
 * Поддерживает множественные окружения: development, test, production
 */
const baseConfig: Knex.Config = {
  client: 'pg',
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    tableName: 'knex_migrations',
    // Disable transactions для migrations которые содержат DDL + DML
    // (PostgreSQL автоматически wraps DDL в transaction)
    disableTransactions: false,
  },
  seeds: {
    directory: path.join(__dirname, 'seeds'),
  },
};
const config = {
  // ================================
  // Development Configuration
  // ================================
  development: {
    ...baseConfig,
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'myapp_dev',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
    },
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
      idleTimeoutMillis: 10000,
      acquireTimeoutMillis: 30000,

      // Lifecycle hooks для debugging
      afterCreate: (conn: any, done: any) => {
        console.log(' New database connection created');
        done(null, conn);
      },
    },
    debug: process.env.DATABASE_DEBUG === 'true',
    migrations: {
      ...baseConfig.migrations,
      extension: 'ts', // ✅ Явно для dev
      loadExtensions: ['.ts'],
    },
    // Log queries в development
    log: {
      warn(message: string) {
        console.warn('  Knex warning:', message);
      },
      error(message: string) {
        console.error(' Knex error:', message);
      },
      deprecate(message: string) {
        console.warn('  Knex deprecation:', message);
      },
      debug(message: string) {
        if (process.env.DATABASE_DEBUG === 'true') {
          console.log(' Knex debug:', message);
        }
      },
    },
  },
  // ================================
  // Test Configuration
  // ================================
  test: {
    ...baseConfig,
    connection: {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'myapp_test',
      user: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
    },
    pool: {
      min: 1,
      max: 5,
      idleTimeoutMillis: 1000,
    },
    // No debug logging в тестах (faster)
    debug: false,
    migrations: {
      ...baseConfig.migrations,
      extension: 'ts', // ✅ Явно для dev
      loadExtensions: ['.ts'],
    },
    // Seeds в test environment
    seeds: {
      directory: path.join(__dirname, 'seeds/test'),
      extension: 'ts',
    },
  },
  // ================================
  // Production Configuration
  // ================================
  production: {
    ...baseConfig,
    connection: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      // SSL в production (обязательно для managed databases)
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: true }
          : false,

      // Connection timeout
      connectionTimeout: 5000,
    },
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '20'),
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 60000,

      // Connection validation
      afterCreate: (conn: any, done: any) => {
        // Set timezone для consistency
        conn.query('SET timezone="UTC";', (err: any) => {
          done(err, conn);
        });
      },
    },
    // NO debug logging в production (performance)
    debug: false,
    // NO seeds в production (только migrations)
    seeds: undefined,
    // Migrations в production должны быть explicit
    migrations: {
      ...baseConfig.migrations,
      // Можно добавить loadExtensions для .js migrations
      // если TypeScript compiled в production
      extension: 'js',
      loadExtensions: ['.js'],
    },
  },
};
export default config;

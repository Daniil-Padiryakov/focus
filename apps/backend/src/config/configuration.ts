// @ts-nocheck
/**
 * Configuration Module
 * Загружает и валидирует environment variables
 */

export default () => ({
  // Application
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),

  // Database
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
      max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
      idleTimeout: parseInt(
        process.env.DATABASE_POOL_IDLE_TIMEOUT || '10000',
        10,
      ),
      acquireTimeout: parseInt(
        process.env.DATABASE_POOL_ACQUIRE_TIMEOUT || '30000',
        10,
      ),
    },
    ssl: process.env.DATABASE_SSL === 'true',
    debug: process.env.DATABASE_DEBUG === 'true',
  },

  // Authentication
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Security
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.LOG_PRETTY === 'true',
  },
});

import * as Joi from 'joi';

/**
 * Joi Validation Schema
 * Валидирует environment variables при старте приложения
 * Fail-fast: приложение не запустится если конфигурация невалидна
 */

export const validationSchema = Joi.object({
  // ================================
  // Application
  // ================================
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development')
    .description('Application environment'),

  PORT: Joi.number().port().default(3000).description('Application port'),

  // ================================
  // Database
  // ================================
  DATABASE_HOST: Joi.string().required().description('PostgreSQL host'),

  DATABASE_PORT: Joi.number()
    .port()
    .default(5432)
    .description('PostgreSQL port'),

  DATABASE_USER: Joi.string().required().description('PostgreSQL user'),

  DATABASE_PASSWORD: Joi.string()
    .min(8)
    .required()
    .description('PostgreSQL password (minimum 8 characters)'),

  DATABASE_NAME: Joi.string()
    .required()
    .description('PostgreSQL database name'),

  DATABASE_POOL_MIN: Joi.number()
    .min(1)
    .max(100)
    .default(2)
    .description('Minimum connections in pool'),

  DATABASE_POOL_MAX: Joi.number()
    .min(1)
    .max(100)
    .default(10)
    .description('Maximum connections in pool'),

  DATABASE_POOL_IDLE_TIMEOUT: Joi.number()
    .min(1000)
    .default(10000)
    .description('Idle timeout in milliseconds'),

  DATABASE_POOL_ACQUIRE_TIMEOUT: Joi.number()
    .min(1000)
    .default(30000)
    .description('Acquire timeout in milliseconds'),

  DATABASE_SSL: Joi.boolean()
    .default(false)
    .description('Enable SSL for database connection'),

  DATABASE_DEBUG: Joi.boolean()
    .default(false)
    .description('Log all SQL queries'),

  // ================================
  // Authentication
  // ================================
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret (minimum 32 characters for security)'),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('7d')
    .description('JWT expiration (e.g., 7d, 24h, 60m)'),

  // ================================
  // Security
  // ================================
  CORS_ORIGIN: Joi.string()
    .required()
    .description('Allowed CORS origins (comma-separated)'),

  RATE_LIMIT_TTL: Joi.number()
    .min(1)
    .default(60)
    .description('Rate limit time window in seconds'),

  RATE_LIMIT_MAX: Joi.number()
    .min(1)
    .default(100)
    .description('Maximum requests per time window'),

  // ================================
  // Logging
  // ================================
  LOG_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info')
    .description('Logging level'),

  LOG_PRETTY: Joi.boolean()
    .default(true)
    .description('Pretty print logs (human-readable)'),

  // ================================
  // External Services (опционально)
  // ================================
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),

  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().port().optional(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
});

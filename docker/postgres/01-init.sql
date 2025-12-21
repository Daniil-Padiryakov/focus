-- ================================
-- PostgreSQL Initialization Script
-- Выполняется автоматически при первом запуске контейнера
-- ================================
-- ВАЖНО: Этот скрипт работает ТОЛЬКО в Docker окружении
-- В CI/CD и других средах используются миграции Knex
-- Миграция 20251025000000_init_schema.ts содержит ту же логику
-- ================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram для full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- GIN indexes для performance

-- Create focus schema (опционально, для namespace)
CREATE SCHEMA IF NOT EXISTS focus;

-- Set default privileges (используем current_user вместо hardcoded postgres)
DO $$
BEGIN
  EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA focus
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', current_user);
END $$;

-- Logging function для auditing
CREATE OR REPLACE FUNCTION focus.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION focus.trigger_set_timestamp() IS 'Автоматически обновляет updated_at timestamp';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database initialization completed successfully';
  RAISE NOTICE '📝 Note: Migrations will also run this logic for non-Docker environments';
END $$;

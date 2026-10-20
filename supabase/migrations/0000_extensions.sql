-- ==============================================================================
-- NOVA - INITIAL DATABASE EXTENSIONS MIGRATION
-- Migration: 0000_extensions.sql
-- ==============================================================================
-- Enables the required PostgreSQL extensions for the Nova project:
-- 1. vector: Provides pgvector data type and operators for semantic embeddings and AI search.
-- 2. pgcrypto: Provides cryptographic functions and UUID generation utilities.
-- ==============================================================================

-- Enable the 'vector' extension in the 'extensions' schema (Supabase best practice)
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- Enable the 'pgcrypto' extension in the 'extensions' schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

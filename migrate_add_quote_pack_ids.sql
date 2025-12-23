-- Migration: Add quote_pack_ids column to sessions table
-- Run this in your Supabase SQL Editor

alter table public.sessions
add column if not exists quote_pack_ids text[] not null default '{}'::text[];




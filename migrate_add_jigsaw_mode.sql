-- Migration: Add jigsaw_mode column to sessions table
-- Run this in your Supabase SQL Editor

-- Add the jigsaw_mode column if it doesn't exist
alter table public.sessions
add column if not exists jigsaw_mode text not null default 'classic';

-- Update existing rows to have the default value (if any are null)
update public.sessions
set jigsaw_mode = 'classic'
where jigsaw_mode is null;



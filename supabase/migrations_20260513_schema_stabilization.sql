-- Add missing columns to profiles table for schema stabilization
alter table public.profiles
  add column if not exists category text,
  add column if not exists tiktok text,
  add column if not exists youtube text,
  add column if not exists banner_url text,
  add column if not exists featured_status text default 'none',
  add column if not exists is_featured boolean default false,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists profile_completed boolean default false,
  add column if not exists display_name text;

-- Backfill display_name if needed
update public.profiles
set display_name = coalesce(display_name, full_name)
where display_name is null;
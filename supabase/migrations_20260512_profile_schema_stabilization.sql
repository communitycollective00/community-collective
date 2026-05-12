-- Full profile schema stabilization for app UI alignment
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists industry text,
  add column if not exists location text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists tiktok text,
  add column if not exists youtube text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists avatar_url text,
  add column if not exists banner_url text,
  add column if not exists featured_status text default 'none',
  add column if not exists is_featured boolean default false,
  add column if not exists is_approved boolean default true,
  add column if not exists profile_completed boolean default false,
  add column if not exists updated_at timestamptz default now();

update public.profiles
set
  display_name = coalesce(display_name, full_name),
  category = coalesce(category, industry),
  is_featured = coalesce(is_featured, featured, false),
  featured_status = coalesce(featured_status, case when coalesce(featured_requested, false) then 'requested' when coalesce(featured, false) then 'featured' else 'none' end),
  is_approved = coalesce(is_approved, true),
  updated_at = coalesce(updated_at, now());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime','video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

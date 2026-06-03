create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text unique,
  bio text,
  description text,
  category text,
  industry text,
  role text not null default 'public' check (role in ('public','professional_pending','professional','member','pending_creator','verified_pending','verified','featured','admin')),
  location text,
  city text,
  state text,
  website text,
  instagram text,
  twitter text,
  linkedin text,
  tiktok text,
  youtube text,
  looking_for text,
  can_offer text,
  avatar_url text,
  banner_url text,
  featured_status text default 'none',
  is_featured boolean not null default false,
  is_approved boolean not null default false,
  featured boolean not null default false,
  featured_requested boolean not null default false,
  invited boolean not null default false,
  professional_name text,
  phone text,
  social_links text,
  credentials text,
  featured_reason text,
  services_offered text,
  onboarding_completed boolean not null default false,
  profile_completed boolean not null default false,
  display_name text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public directory read" on public.profiles
for select using (true);

create policy "Users can upsert own profile" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  city text not null,
  state text not null,
  application_type text not null check (application_type in ('public_member', 'professional_organization')),
  industry text not null,
  reason text not null,
  website_social text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;

create policy "Anyone can submit applications" on public.applications
for insert with check (true);

create policy "Only admins can view applications" on public.applications
for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  submission_type text not null check (submission_type in ('person', 'event', 'organization', 'opportunity', 'community_story', 'business', 'speaker', 'mentor')),
  name text not null,
  organization text,
  email text not null,
  location text not null,
  reason text not null,
  website_social text not null,
  additional_notes text,
  submitted_by uuid references public.profiles(id) on delete set null,
  submitted_email text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recommendations enable row level security;

create policy "Anyone can submit recommendations" on public.recommendations
for insert with check (true);

create policy "Only admins can view all recommendations" on public.recommendations
for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

create policy "Users can view their own recommendations" on public.recommendations
for select using (auth.uid() = submitted_by);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  post_type text not null default 'article' check (post_type in ('article','video','link','image')),
  media_url text,
  link_url text,
  image_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Public post read" on public.posts
for select using (true);

create policy "Authors can manage own posts" on public.posts
for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public media read" on storage.objects
for select using (bucket_id = 'media');

create policy "Users upload own media" on storage.objects
for insert with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own media" on storage.objects
for update using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);
alter table public.profiles
add column if not exists banner_url text;


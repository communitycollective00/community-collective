create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text unique,
  bio text,
  description text,
  category text,
  industry text,
  role text not null default 'member' check (role in ('member','pending_creator','verified_pending','verified','featured','admin')),
  location text,
  city text,
  state text,
  website text,
  instagram text,
  twitter text,
  linkedin text,
  tiktok text,
  youtube text,
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

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public media read" on storage.objects
for select using (bucket_id = 'media');

create policy "Users upload own media" on storage.objects
for insert with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own media" on storage.objects
for update using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

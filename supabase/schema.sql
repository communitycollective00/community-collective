create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  username text unique,
  bio text,
  city text,
  state text,
  industry text,
  website text,
  instagram text,
  linkedin text,
  avatar_url text,
  role text not null default 'community' check (role in ('community','verified','admin')),
  featured boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public directory read" on public.profiles
for select using (true);

create policy "Users can upsert own profile" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public avatar read" on storage.objects
for select using (bucket_id = 'avatars');

create policy "Users upload own avatar" on storage.objects
for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own avatar" on storage.objects
for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

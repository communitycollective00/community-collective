-- Complete profiles schema normalization (safe ALTER TABLE for existing data)
alter table if exists public.profiles
  add column if not exists id uuid,
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists username text,
  add column if not exists bio text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists industry text,
  add column if not exists role text,
  add column if not exists location text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists tiktok text,
  add column if not exists youtube text,
  add column if not exists avatar_url text,
  add column if not exists banner_url text,
  add column if not exists featured_status text default 'none',
  add column if not exists is_featured boolean default false,
  add column if not exists is_approved boolean default true,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists profile_completed boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Ensure primary key on id
alter table if exists public.profiles
  alter column id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'p'
  ) then
    alter table public.profiles add constraint profiles_pkey primary key (id);
  end if;
end $$;

-- Backfill aliases/legacy fields into canonical fields
update public.profiles
set
  full_name = coalesce(nullif(full_name, ''), nullif(display_name, '')),
  category = coalesce(nullif(category, ''), nullif(industry, '')),
  industry = coalesce(nullif(industry, ''), nullif(category, '')),
  location = coalesce(nullif(location, ''), concat_ws(', ', nullif(city, ''), nullif(state, ''))),
  updated_at = coalesce(updated_at, now()),
  created_at = coalesce(created_at, now())
where true;

-- Harden defaults
alter table if exists public.profiles
  alter column featured_status set default 'none',
  alter column is_featured set default false,
  alter column is_approved set default true,
  alter column onboarding_completed set default false,
  alter column profile_completed set default false,
  alter column created_at set default now(),
  alter column updated_at set default now();

-- Keep updated_at fresh on writes
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_profiles_updated_at();

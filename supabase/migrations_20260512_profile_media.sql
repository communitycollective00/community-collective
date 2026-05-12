-- Safe schema/storage alignment for onboarding + media uploads
alter table public.profiles
  add column if not exists industry text,
  add column if not exists role text not null default 'member',
  add column if not exists location text,
  add column if not exists twitter text,
  add column if not exists description text,
  add column if not exists services_offered text,
  add column if not exists social_links text,
  add column if not exists avatar_url text,
  add column if not exists updated_at timestamptz not null default now();

-- keep role constraint stable if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role in ('member','pending_creator','verified_pending','verified','featured','admin'));
  END IF;
END $$;

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

create policy if not exists "Public media read" on storage.objects
for select using (bucket_id = 'media');

create policy if not exists "Users upload own media" on storage.objects
for insert with check (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

create policy if not exists "Users update own media" on storage.objects
for update using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]);

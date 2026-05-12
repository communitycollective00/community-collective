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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public media read'
  ) THEN
    CREATE POLICY "Public media read" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users upload own media'
  ) THEN
    CREATE POLICY "Users upload own media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users update own media'
  ) THEN
    CREATE POLICY "Users update own media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

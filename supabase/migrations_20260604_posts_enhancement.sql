-- Add richer posts/media fields and tightened RLS policies

-- add columns if missing
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS caption text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[],
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS external_url text;

-- ensure media_type and visibility and status constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'posts_media_type'
  ) THEN
    CREATE TYPE posts_media_type AS ENUM ('image','video','text','link','interview','opportunity','article');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'posts_visibility'
  ) THEN
    CREATE TYPE posts_visibility AS ENUM ('public','private','members');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'posts_status'
  ) THEN
    CREATE TYPE posts_status AS ENUM ('draft','published','pending_review','archived');
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- try to cast columns to enums where possible (safe - ignore failures)
DO $$
BEGIN
  ALTER TABLE public.posts
    ALTER COLUMN media_type TYPE posts_media_type USING (
      CASE
        WHEN media_type IN ('image','video','text','link','interview','opportunity','article') THEN media_type::posts_media_type
        ELSE 'image'::posts_media_type
      END
    );
EXCEPTION WHEN others THEN
  -- ignore if cannot cast
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.posts
    ALTER COLUMN visibility TYPE posts_visibility USING (
      CASE
        WHEN visibility IN ('public','private','members') THEN visibility::posts_visibility
        ELSE 'public'::posts_visibility
      END
    );
EXCEPTION WHEN others THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.posts
    ALTER COLUMN status TYPE posts_status USING (
      CASE
        WHEN status IN ('draft','published','pending_review','archived') THEN status::posts_status
        ELSE 'published'::posts_status
      END
    );
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- tighten RLS policies: remove permissive policies and recreate specific ones
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Public post read') THEN
    DROP POLICY "Public post read" ON public.posts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Authors can manage own posts') THEN
    DROP POLICY "Authors can manage own posts" ON public.posts;
  END IF;
END $$;

-- ensure RLS is enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Public: read published posts with public visibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Public published public read'
  ) THEN
    CREATE POLICY "Public published public read" ON public.posts
      FOR SELECT USING (status = 'published' AND visibility = 'public');
  END IF;

  -- Authors: allow select/insert/update/delete for their own posts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Authors can manage own posts'
  ) THEN
    CREATE POLICY "Authors can manage own posts" ON public.posts
      FOR ALL USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
  END IF;

  -- Admins: allow full access based on profile role
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Admins can manage posts'
  ) THEN
    CREATE POLICY "Admins can manage posts" ON public.posts
      FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')) WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
  END IF;
END $$;

-- Make sure storage bucket exists (keeps previous behavior)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- keep public media read policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public media read'
  ) THEN
    CREATE POLICY "Public media read" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
  END IF;
END $$;

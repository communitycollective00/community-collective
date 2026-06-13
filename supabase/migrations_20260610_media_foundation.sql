-- Phase 2: Media Foundation - Enhanced Posts Schema
-- Support for Interview, Event Coverage, Community Story, Insight, Opportunity post types
-- And native media uploads with rich metadata

-- Expand post_type constraint to include new types
alter table public.posts 
drop constraint if exists posts_post_type_check;

alter table public.posts
add constraint posts_post_type_check 
check (post_type in (
  'interview',
  'event',
  'story',
  'insight',
  'opportunity',
  'article',
  'video',
  'link',
  'image'
));

-- Add new columns to posts table for media foundation
alter table public.posts
add column if not exists caption text,
add column if not exists location text,
add column if not exists location_lat numeric,
add column if not exists location_lng numeric,
add column if not exists media_type text default 'image' check (media_type in ('image', 'video', 'audio')),
add column if not exists video_url text,
add column if not exists thumbnail_url text,
add column if not exists tags jsonb default '[]'::jsonb;

-- Add interview-specific columns
alter table public.posts
add column if not exists interview_guest_name text,
add column if not exists interview_guest_title text,
add column if not exists interview_guest_organization text,
add column if not exists interview_summary text,
add column if not exists interview_key_takeaways jsonb default '[]'::jsonb,
add column if not exists interview_video_url text,
add column if not exists interview_cover_url text;

-- Add columns for tagging related content
alter table public.posts
add column if not exists related_profiles uuid[] default '{}',
add column if not exists related_events uuid[] default '{}',
add column if not exists save_count integer default 0,
add column if not exists view_count integer default 0;

-- Create saves table for users to save posts
create table if not exists public.post_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

alter table public.post_saves enable row level security;

create policy "Users can view their own saves" on public.post_saves
for select using (auth.uid() = user_id);

create policy "Users can save posts" on public.post_saves
for insert with check (auth.uid() = user_id);

create policy "Users can remove their saves" on public.post_saves
for delete using (auth.uid() = user_id);

-- Create post engagements table for tracking interactions
create table if not exists public.post_engagements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  engagement_type text not null check (engagement_type in ('view', 'share')),
  created_at timestamptz not null default now()
);

alter table public.post_engagements enable row level security;

create policy "Anyone can log engagements" on public.post_engagements
for insert with check (true);

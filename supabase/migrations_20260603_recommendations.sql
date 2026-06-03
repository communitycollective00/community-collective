-- Create recommendations table for community submissions
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

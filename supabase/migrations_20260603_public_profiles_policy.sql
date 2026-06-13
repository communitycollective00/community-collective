-- Allow public access to profile rows that have a valid username
create policy "Public profiles are viewable by username" on public.profiles
for select using (
  username is not null
  and trim(username) <> ''
);

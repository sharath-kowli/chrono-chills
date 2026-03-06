
-- 0. Function to handle updated_at timestamps automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 1. Create Watch History Table
create table public.watch_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  episode_id text not null,
  timestamp integer default 0,
  completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, episode_id)
);

alter table public.watch_history enable row level security;

create trigger on_watch_history_updated
before update on public.watch_history
for each row execute procedure public.handle_updated_at();

create policy "Users can view their own watch history"
on public.watch_history for select
using ( auth.uid() = user_id );

create policy "Users can insert their own watch history"
on public.watch_history for insert
with check ( auth.uid() = user_id );

create policy "Users can update their own watch history"
on public.watch_history for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

create policy "Users can delete their own watch history"
on public.watch_history for delete
using ( auth.uid() = user_id );

-- 2. Create Bookmarks Table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  episode_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, episode_id)
);

alter table public.bookmarks enable row level security;

create policy "Users can view their own bookmarks"
on public.bookmarks for select
using ( auth.uid() = user_id );

create policy "Users can insert their own bookmarks"
on public.bookmarks for insert
with check ( auth.uid() = user_id );

create policy "Users can delete their own bookmarks"
on public.bookmarks for delete
using ( auth.uid() = user_id );

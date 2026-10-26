-- Saved styles: one row per user and style. Users can only see and change their own rows.
create table if not exists public.saved_styles (
  user_id    uuid not null references auth.users (id) on delete cascade,
  slug       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, slug)
);

alter table public.saved_styles enable row level security;

create policy "Users read their saved styles"
  on public.saved_styles for select
  using (auth.uid() = user_id);

create policy "Users save styles for themselves"
  on public.saved_styles for insert
  with check (auth.uid() = user_id);

create policy "Users remove their saved styles"
  on public.saved_styles for delete
  using (auth.uid() = user_id);

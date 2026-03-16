-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Flows Table
create table public.flows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  title text not null default 'Untitled Flow',
  folder_id uuid, -- We will keep it simple and not enforce FK for folders yet to avoid complexity
  metadata jsonb default '{}'::jsonb, -- Stores thumbnail, description, etc.
  content jsonb default '{}'::jsonb, -- Stores the actual nodes and edges
  is_public boolean default false,
  deleted_at timestamp with time zone, -- Soft delete support for Trash/Restore
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Backward-compatible migration for existing databases
alter table public.flows add column if not exists deleted_at timestamp with time zone;
create index if not exists flows_deleted_at_idx on public.flows (deleted_at);

-- Create Folders Table
create table public.folders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.flows enable row level security;
alter table public.folders enable row level security;

-- Policies for Flows
create policy "Users can view their own flows"
  on flows for select
  using ( auth.uid() = user_id );

create policy "Users can view public flows"
  on flows for select
  using ( is_public = true );

create policy "Users can insert their own flows"
  on flows for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own flows"
  on flows for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own flows"
  on flows for delete
  using ( auth.uid() = user_id );

-- Policies for Folders
create policy "Users can view their own folders"
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders"
  on folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders"
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders"
  on folders for delete
  using ( auth.uid() = user_id );

-- =========================================================
-- Share Comments (Prototype Review)
-- =========================================================

create table if not exists public.flow_comments (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  parent_id uuid references public.flow_comments(id) on delete cascade,
  author_name text not null,
  author_user_id uuid references auth.users,
  author_avatar_url text,
  message text not null,
  status text not null default 'open',
  pin_x double precision,
  pin_y double precision,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint flow_comments_status_check check (status in ('open', 'resolved')),
  constraint flow_comments_message_not_empty check (char_length(trim(message)) > 0),
  constraint flow_comments_root_or_reply_pin_check check (
    (
      parent_id is null
      and (
        (
          anchor_mode is null
          and pin_x is not null
          and pin_y is not null
          and pin_x >= 0 and pin_x <= 100
          and pin_y >= 0 and pin_y <= 100
        )
        or (
          anchor_mode = 'review'
          and pin_x is not null
          and pin_y is not null
          and pin_x >= 0 and pin_x <= 100
          and pin_y >= 0 and pin_y <= 100
        )
        or (
          anchor_mode = 'canvas'
          and anchor_canvas_type = 'node'
          and pin_x is null
          and pin_y is null
          and anchor_step_id is not null
          and anchor_local_x is not null
          and anchor_local_y is not null
          and anchor_local_x >= 0 and anchor_local_x <= 100
          and anchor_local_y >= 0 and anchor_local_y <= 100
          and anchor_canvas_x is null
          and anchor_canvas_y is null
        )
        or (
          anchor_mode = 'canvas'
          and anchor_canvas_type = 'free'
          and pin_x is null
          and pin_y is null
          and anchor_step_id is null
          and anchor_local_x is null
          and anchor_local_y is null
          and anchor_canvas_x is not null
          and anchor_canvas_y is not null
        )
      )
    )
    or (
      parent_id is not null
      and pin_x is null
      and pin_y is null
      and anchor_canvas_x is null
      and anchor_canvas_y is null
    )
  )
);

alter table public.flow_comments add column if not exists author_avatar_url text;
alter table public.flow_comments add column if not exists anchor_mode text;
alter table public.flow_comments add column if not exists anchor_kind text;
alter table public.flow_comments add column if not exists anchor_block_id text;
alter table public.flow_comments add column if not exists anchor_step_id text;
alter table public.flow_comments add column if not exists anchor_component_id text;
alter table public.flow_comments add column if not exists anchor_history_index integer;
alter table public.flow_comments add column if not exists anchor_local_x double precision;
alter table public.flow_comments add column if not exists anchor_local_y double precision;
alter table public.flow_comments add column if not exists anchor_canvas_type text;
alter table public.flow_comments add column if not exists anchor_canvas_x double precision;
alter table public.flow_comments add column if not exists anchor_canvas_y double precision;
alter table public.flow_comments add column if not exists path_signature text;

alter table public.flow_comments drop constraint if exists flow_comments_root_or_reply_pin_check;
alter table public.flow_comments add constraint flow_comments_root_or_reply_pin_check
  check (
    (
      parent_id is null
      and (
        (
          anchor_mode is null
          and pin_x is not null
          and pin_y is not null
          and pin_x >= 0 and pin_x <= 100
          and pin_y >= 0 and pin_y <= 100
        )
        or (
          anchor_mode = 'review'
          and pin_x is not null
          and pin_y is not null
          and pin_x >= 0 and pin_x <= 100
          and pin_y >= 0 and pin_y <= 100
        )
        or (
          anchor_mode = 'canvas'
          and anchor_canvas_type = 'node'
          and pin_x is null
          and pin_y is null
          and anchor_step_id is not null
          and anchor_local_x is not null
          and anchor_local_y is not null
          and anchor_local_x >= 0 and anchor_local_x <= 100
          and anchor_local_y >= 0 and anchor_local_y <= 100
          and anchor_canvas_x is null
          and anchor_canvas_y is null
        )
        or (
          anchor_mode = 'canvas'
          and anchor_canvas_type = 'free'
          and pin_x is null
          and pin_y is null
          and anchor_step_id is null
          and anchor_local_x is null
          and anchor_local_y is null
          and anchor_canvas_x is not null
          and anchor_canvas_y is not null
        )
      )
    )
    or (
      parent_id is not null
      and pin_x is null
      and pin_y is null
      and anchor_canvas_x is null
      and anchor_canvas_y is null
    )
  );

alter table public.flow_comments drop constraint if exists flow_comments_anchor_mode_check;
alter table public.flow_comments add constraint flow_comments_anchor_mode_check
  check (anchor_mode is null or anchor_mode in ('canvas', 'review'));

alter table public.flow_comments drop constraint if exists flow_comments_anchor_kind_check;
alter table public.flow_comments add constraint flow_comments_anchor_kind_check
  check (
    anchor_kind is null
    or anchor_kind in ('turn', 'component', 'decision', 'feedback')
  );

alter table public.flow_comments drop constraint if exists flow_comments_anchor_canvas_type_check;
alter table public.flow_comments add constraint flow_comments_anchor_canvas_type_check
  check (anchor_canvas_type is null or anchor_canvas_type in ('node', 'free'));

create index if not exists flow_comments_flow_id_idx on public.flow_comments(flow_id);
create index if not exists flow_comments_parent_id_idx on public.flow_comments(parent_id);
create index if not exists flow_comments_status_idx on public.flow_comments(status);
create index if not exists flow_comments_created_at_idx on public.flow_comments(created_at);
create index if not exists flow_comments_anchor_mode_idx on public.flow_comments(anchor_mode);
create index if not exists flow_comments_path_signature_idx on public.flow_comments(path_signature);

alter table public.flow_comments enable row level security;
revoke insert, update, delete on public.flow_comments from anon;
grant select on public.flow_comments to anon, authenticated;
grant insert, update, delete on public.flow_comments to authenticated;

drop policy if exists "Anyone can view comments on accessible flows" on public.flow_comments;
create policy "Anyone can view comments on accessible flows"
  on public.flow_comments
  for select
  using (
    exists (
      select 1
      from public.flows f
      where f.id = flow_comments.flow_id
        and (f.is_public = true or f.user_id = auth.uid())
    )
  );

drop policy if exists "Anyone can insert comments on accessible flows" on public.flow_comments;
drop policy if exists "Signed-in users can insert comments on accessible flows" on public.flow_comments;
create policy "Signed-in users can insert comments on accessible flows"
  on public.flow_comments
  for insert
  with check (
    exists (
      select 1
      from public.flows f
      where f.id = flow_comments.flow_id
        and (f.is_public = true or f.user_id = auth.uid())
    )
    and auth.uid() is not null
    and author_user_id = auth.uid()
  );

drop policy if exists "Anyone can update comments on accessible flows" on public.flow_comments;
drop policy if exists "Signed-in users can update comments on accessible flows" on public.flow_comments;
drop policy if exists "Authors and flow owners can update comments" on public.flow_comments;
create policy "Authors and flow owners can update comments"
  on public.flow_comments
  for update
  using (
    auth.uid() is not null
    and (
      flow_comments.author_user_id = auth.uid()
      or exists (
        select 1
        from public.flows f
        where f.id = flow_comments.flow_id
          and f.user_id = auth.uid()
      )
    )
  )
  with check (
    auth.uid() is not null
    and (
      flow_comments.author_user_id = auth.uid()
      or exists (
        select 1
        from public.flows f
        where f.id = flow_comments.flow_id
          and f.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Authors and flow owners can delete comments" on public.flow_comments;
create policy "Authors and flow owners can delete comments"
  on public.flow_comments
  for delete
  using (
    auth.uid() is not null
    and (
      flow_comments.author_user_id = auth.uid()
      or exists (
        select 1
        from public.flows f
        where f.id = flow_comments.flow_id
          and f.user_id = auth.uid()
      )
    )
  );

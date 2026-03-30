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

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text,
  avatar_url text,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  computed_display_name text;
  computed_avatar_url text;
begin
  computed_display_name := nullif(
    trim(
      coalesce(
        metadata ->> 'full_name',
        metadata ->> 'name',
        split_part(coalesce(new.email, ''), '@', 1),
        'Signed-in user'
      )
    ),
    ''
  );

  computed_avatar_url := nullif(
    trim(coalesce(metadata ->> 'avatar_url', metadata ->> 'picture', '')),
    ''
  );

  insert into public.profiles (
    user_id,
    display_name,
    email,
    avatar_url,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(computed_display_name, 'Signed-in user'),
    new.email,
    computed_avatar_url,
    new.last_sign_in_at,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  on conflict (user_id) do update
  set
    display_name = excluded.display_name,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    last_sign_in_at = excluded.last_sign_in_at,
    updated_at = timezone('utc'::text, now());

  return new;
end;
$$;

drop trigger if exists sync_profile_from_auth_user on auth.users;
create trigger sync_profile_from_auth_user
after insert or update of email, raw_user_meta_data, last_sign_in_at
on auth.users
for each row
execute function public.sync_profile_from_auth_user();

insert into public.profiles (
  user_id,
  display_name,
  email,
  avatar_url,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  users.id,
  coalesce(
    nullif(trim(coalesce(users.raw_user_meta_data ->> 'full_name', users.raw_user_meta_data ->> 'name')), ''),
    nullif(trim(split_part(coalesce(users.email, ''), '@', 1)), ''),
    'Signed-in user'
  ),
  users.email,
  nullif(
    trim(coalesce(users.raw_user_meta_data ->> 'avatar_url', users.raw_user_meta_data ->> 'picture', '')),
    ''
  ),
  users.last_sign_in_at,
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
from auth.users
on conflict (user_id) do update
set
  display_name = excluded.display_name,
  email = excluded.email,
  avatar_url = excluded.avatar_url,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = timezone('utc'::text, now());

create table if not exists public.flow_collaborators (
  flow_id uuid not null references public.flows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'commenter',
  source text not null default 'mention',
  granted_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (flow_id, user_id),
  constraint flow_collaborators_role_check check (role in ('commenter')),
  constraint flow_collaborators_source_check check (source in ('mention'))
);

create index if not exists flow_collaborators_user_id_idx on public.flow_collaborators(user_id);

-- Set up Row Level Security (RLS)
alter table public.flows enable row level security;
alter table public.folders enable row level security;
alter table public.profiles enable row level security;
alter table public.flow_collaborators enable row level security;

-- Policies for Flows
create policy "Users can view their own flows"
  on flows for select
  using ( auth.uid() = user_id );

create policy "Users can view public flows"
  on flows for select
  using ( is_public = true );

drop policy if exists "Users can view flows they collaborate on" on flows;
create policy "Users can view flows they collaborate on"
  on flows for select
  using (
    auth.uid() is not null
    and exists (
      select 1
      from public.flow_collaborators collaborators
      where collaborators.flow_id = flows.id
        and collaborators.user_id = auth.uid()
    )
  );

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

grant select on public.profiles to authenticated;
drop policy if exists "Authenticated users can view active profiles" on public.profiles;
create policy "Authenticated users can view active profiles"
  on public.profiles for select
  using (auth.uid() is not null and last_sign_in_at is not null);

grant select on public.flow_collaborators to authenticated;
drop policy if exists "Users can view their collaborator access" on public.flow_collaborators;
create policy "Users can view their collaborator access"
  on public.flow_collaborators for select
  using (
    auth.uid() is not null
    and (
      user_id = auth.uid()
      or granted_by_user_id = auth.uid()
    )
  );

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

create table if not exists public.flow_comment_mentions (
  id uuid primary key default uuid_generate_v4(),
  comment_id uuid not null references public.flow_comments(id) on delete cascade,
  mentioned_user_id uuid not null references auth.users(id) on delete cascade,
  mentioned_by_user_id uuid not null references auth.users(id) on delete cascade,
  email_status text not null default 'pending',
  email_sent_at timestamp with time zone,
  email_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint flow_comment_mentions_status_check check (email_status in ('pending', 'sent', 'failed')),
  constraint flow_comment_mentions_unique_recipient unique (comment_id, mentioned_user_id)
);

create index if not exists flow_comment_mentions_comment_id_idx
  on public.flow_comment_mentions(comment_id);
create index if not exists flow_comment_mentions_mentioned_user_id_idx
  on public.flow_comment_mentions(mentioned_user_id);

alter table public.flow_comments enable row level security;
revoke insert, update, delete on public.flow_comments from anon;
grant select on public.flow_comments to anon, authenticated;
grant insert, update, delete on public.flow_comments to authenticated;

alter table public.flow_comment_mentions enable row level security;

drop policy if exists "Anyone can view comments on accessible flows" on public.flow_comments;
create policy "Anyone can view comments on accessible flows"
  on public.flow_comments
  for select
  using (
    exists (
      select 1
      from public.flows f
      where f.id = flow_comments.flow_id
        and (
          f.is_public = true
          or f.user_id = auth.uid()
          or exists (
            select 1
            from public.flow_collaborators collaborators
            where collaborators.flow_id = f.id
              and collaborators.user_id = auth.uid()
          )
        )
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
        and (
          f.is_public = true
          or f.user_id = auth.uid()
          or exists (
            select 1
            from public.flow_collaborators collaborators
            where collaborators.flow_id = f.id
              and collaborators.user_id = auth.uid()
          )
        )
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

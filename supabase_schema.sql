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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

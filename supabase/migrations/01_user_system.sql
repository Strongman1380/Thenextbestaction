-- 1. PROFILES (Links to your Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text default 'caseworker',
  organization text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CLIENTS (The people you are helping)
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  caseworker_id uuid references public.profiles(id) on delete cascade not null,
  initials text not null,
  zip_code text,
  status text default 'active',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CASE PLANS (The AI generated plans)
create table if not exists public.case_plans (
  id uuid default gen_random_uuid() primary key,
  caseworker_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  content text not null,
  primary_need text,
  urgency text,
  input_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SAVED RESOURCES (Skill building worksheets, etc)
create table if not exists public.saved_resources (
  id uuid default gen_random_uuid() primary key,
  caseworker_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  content text not null,
  resource_type text not null,
  topic text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. FEEDBACK LOGS (To track if AI results are good/bad)
create table if not exists public.feedback_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  content_id text,
  content_type text,
  feedback_type text,
  generated_content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE SECURITY (Row Level Security)
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.case_plans enable row level security;
alter table public.saved_resources enable row level security;
alter table public.feedback_logs enable row level security;

-- POLICIES (Who can see what)

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Clients
create policy "Users can view own clients" on public.clients for select using (auth.uid() = caseworker_id);
create policy "Users can insert own clients" on public.clients for insert with check (auth.uid() = caseworker_id);
create policy "Users can update own clients" on public.clients for update using (auth.uid() = caseworker_id);
create policy "Users can delete own clients" on public.clients for delete using (auth.uid() = caseworker_id);

-- Case Plans
create policy "Users can view own plans" on public.case_plans for select using (auth.uid() = caseworker_id);
create policy "Users can insert own plans" on public.case_plans for insert with check (auth.uid() = caseworker_id);

-- Saved Resources
create policy "Users can view own resources" on public.saved_resources for select using (auth.uid() = caseworker_id);
create policy "Users can insert own resources" on public.saved_resources for insert with check (auth.uid() = caseworker_id);

-- Feedback
create policy "Anyone can insert feedback" on public.feedback_logs for insert with check (true);

-- AUTOMATION: Create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on sign up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

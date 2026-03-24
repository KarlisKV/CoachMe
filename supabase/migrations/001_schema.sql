-- profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('client', 'coach')),
  full_name text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- coach_profiles
create table public.coach_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  sport text not null default '',
  specialty text,
  description text,
  hourly_rate numeric(10,2),
  contact_email text,
  contact_phone text,
  location text,
  experience_years integer
);

-- client_profiles
create table public.client_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  skill_level text check (skill_level in ('beginner', 'intermediate', 'advanced')),
  sports_interests text[] default '{}'
);

-- availability_slots
create table public.availability_slots (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.coach_profiles(id) on delete cascade not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_recurring boolean default true,
  created_at timestamptz default now(),
  constraint valid_time_range check (start_time < end_time)
);

-- bookings
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.client_profiles(id) on delete cascade not null,
  coach_id uuid references public.coach_profiles(id) on delete cascade not null,
  slot_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- Indexes
create index idx_coach_profiles_sport on public.coach_profiles(sport);
create index idx_coach_profiles_location on public.coach_profiles(location);
create index idx_availability_coach on public.availability_slots(coach_id);
create index idx_bookings_coach on public.bookings(coach_id);
create index idx_bookings_client on public.bookings(client_id);
create index idx_bookings_date on public.bookings(slot_date);

-- RLS
alter table public.profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings enable row level security;

-- profiles policies
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- coach_profiles policies
create policy "Coach profiles are viewable by everyone" on public.coach_profiles for select using (true);
create policy "Coaches can insert own profile" on public.coach_profiles for insert with check (auth.uid() = id);
create policy "Coaches can update own profile" on public.coach_profiles for update using (auth.uid() = id);
create policy "Coaches can delete own profile" on public.coach_profiles for delete using (auth.uid() = id);

-- client_profiles policies
create policy "Client profiles are viewable by everyone" on public.client_profiles for select using (true);
create policy "Clients can insert own profile" on public.client_profiles for insert with check (auth.uid() = id);
create policy "Clients can update own profile" on public.client_profiles for update using (auth.uid() = id);
create policy "Clients can delete own profile" on public.client_profiles for delete using (auth.uid() = id);

-- availability_slots policies
create policy "Slots are viewable by everyone" on public.availability_slots for select using (true);
create policy "Coaches can insert own slots" on public.availability_slots for insert with check (auth.uid() = coach_id);
create policy "Coaches can update own slots" on public.availability_slots for update using (auth.uid() = coach_id);
create policy "Coaches can delete own slots" on public.availability_slots for delete using (auth.uid() = coach_id);

-- bookings policies
create policy "Users can view own bookings" on public.bookings for select using (auth.uid() = client_id or auth.uid() = coach_id);
create policy "Clients can create bookings" on public.bookings for insert with check (auth.uid() = client_id);
create policy "Involved parties can update bookings" on public.bookings for update using (auth.uid() = client_id or auth.uid() = coach_id);

-- Race-condition-safe booking function
create or replace function public.create_booking(
  p_client_id uuid, p_coach_id uuid, p_slot_date date,
  p_start_time time, p_end_time time
) returns uuid as $$
declare
  v_id uuid;
begin
  if exists (
    select 1 from public.bookings
    where coach_id = p_coach_id and slot_date = p_slot_date
    and status in ('pending', 'confirmed')
    and start_time < p_end_time and end_time > p_start_time
  ) then
    raise exception 'Slot already booked';
  end if;
  insert into public.bookings (client_id, coach_id, slot_date, start_time, end_time)
  values (p_client_id, p_coach_id, p_slot_date, p_start_time, p_end_time)
  returning id into v_id;
  return v_id;
end;
$$ language plpgsql security definer;

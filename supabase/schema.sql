-- Ambient Care — Supabase schema
-- Run this in the Supabase SQL editor, then add EXPO_PUBLIC_SUPABASE_URL /
-- EXPO_PUBLIC_SUPABASE_ANON_KEY to .env (see src/lib/supabase.ts). Idempotent:
-- safe to re-run as the app model grows. The app also runs fully local on one
-- device without this; wiring it in lights up real accounts + cross-device codes.

-- ── Caregiver profiles ───────────────────────────────────────────────────────
-- One row per auth user, auto-created on signup from the `name` in metadata.
create table if not exists profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  created_at timestamptz not null default now()
);
alter table profiles enable row level security;
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles for all using (id = auth.uid());

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- ── Care recipients ──────────────────────────────────────────────────────────
-- A caregiver has many; each carries a join code the home device enters to bind.
create table if not exists loved_ones (
  id            uuid primary key default gen_random_uuid(),
  caregiver_id  uuid references auth.users (id) on delete cascade,
  name          text not null,
  relationship  text not null,
  pairing_code  text not null unique,
  paired        boolean not null default false,
  ambient_opt_in boolean not null default false,
  always_on_mode boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Columns added as the app model grew (safe on an existing table).
alter table loved_ones add column if not exists language text;
alter table loved_ones add column if not exists voice_id text;
alter table loved_ones add column if not exists voice_region text;
alter table loved_ones add column if not exists speech_rate real;
alter table loved_ones add column if not exists dob text;
alter table loved_ones add column if not exists blood_type text;
alter table loved_ones add column if not exists allergies text[];
alter table loved_ones add column if not exists conditions text[];
alter table loved_ones add column if not exists emergency_contacts jsonb;
alter table loved_ones add column if not exists doctor text;
alter table loved_ones add column if not exists pharmacy text;
alter table loved_ones add column if not exists medical_notes text;
alter table loved_ones add column if not exists dyslexia_font boolean;
alter table loved_ones add column if not exists color_scheme text;

create table if not exists medications (
  id            uuid primary key default gen_random_uuid(),
  loved_one_id  uuid references loved_ones (id) on delete cascade,
  name          text not null,
  dosage        text not null,
  schedule      text not null,          -- morning | midday | evening | bedtime | asNeeded
  friendly_name text not null,
  barcode       text,
  photo_url     text,
  created_at    timestamptz not null default now()
);
alter table medications add column if not exists generic_name text;
alter table medications add column if not exists times text[];
alter table medications add column if not exists critical boolean default false;
alter table medications add column if not exists pills_on_hand int;
alter table medications add column if not exists refill_threshold int;

-- Dose history — one row per scheduled dose and what became of it.
create table if not exists dose_logs (
  id            uuid primary key default gen_random_uuid(),
  loved_one_id  uuid references loved_ones (id) on delete cascade,
  med_id        uuid references medications (id) on delete cascade,
  scheduled_at  timestamptz not null,
  status        text not null,          -- taken | missed | skipped
  taken_at      timestamptz,
  source        text not null,          -- scan | manual | auto
  created_at    timestamptz not null default now()
);

-- The event stream — the caregiver dashboard subscribes to this via realtime.
create table if not exists care_events (
  id            uuid primary key default gen_random_uuid(),
  loved_one_id  uuid references loved_ones (id) on delete cascade,
  kind          text not null,          -- scan_match | voice_distress | loud_sound | ...
  severity      text not null,          -- info | checkIn | urgent
  title         text not null,
  detail        text,
  occurred_at   timestamptz not null default now()
);

create index if not exists care_events_loved_one_time_idx
  on care_events (loved_one_id, occurred_at desc);

-- ── Row-level security: a caregiver only sees their own household's rows ──────
alter table loved_ones  enable row level security;
alter table medications enable row level security;
alter table dose_logs   enable row level security;
alter table care_events enable row level security;

drop policy if exists "own households" on loved_ones;
create policy "own households" on loved_ones
  for all using (caregiver_id = auth.uid());

drop policy if exists "own meds" on medications;
create policy "own meds" on medications
  for all using (
    loved_one_id in (select id from loved_ones where caregiver_id = auth.uid())
  );

drop policy if exists "own dose logs" on dose_logs;
create policy "own dose logs" on dose_logs
  for all using (
    loved_one_id in (select id from loved_ones where caregiver_id = auth.uid())
  );

drop policy if exists "own events" on care_events;
create policy "own events" on care_events
  for all using (
    loved_one_id in (select id from loved_ones where caregiver_id = auth.uid())
  );

-- ── Join-code redemption for the (unauthenticated) home device ────────────────
-- The senior device has no account, so RLS would block it from reading a
-- recipient. This SECURITY DEFINER function lets it bind by code and marks the
-- recipient paired. SECURITY NOTE: it returns the recipient row to any caller who
-- knows the code — for production, use longer codes and add rate limiting.
create or replace function redeem_code(code text)
returns setof loved_ones language sql security definer set search_path = public as $$
  update loved_ones
     set paired = true
   where upper(pairing_code) = upper(trim(code))
  returning *;
$$;
grant execute on function redeem_code(text) to anon, authenticated;

-- Stream care_events to subscribed clients in real time.
alter publication supabase_realtime add table care_events;

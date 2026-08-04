-- Ambient Care — Supabase schema
-- Run this in the Supabase SQL editor, then add EXPO_PUBLIC_SUPABASE_URL /
-- EXPO_PUBLIC_SUPABASE_ANON_KEY to .env (see src/lib/supabase.ts). The app runs
-- fully local without this; wiring it in lights up real cross-device sync.

-- Households pair one caregiver account with one senior device.
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

-- Row-level security: a caregiver only sees their own household's rows.
alter table loved_ones  enable row level security;
alter table medications enable row level security;
alter table care_events enable row level security;

create policy "own households" on loved_ones
  for all using (caregiver_id = auth.uid());

create policy "own meds" on medications
  for all using (
    loved_one_id in (select id from loved_ones where caregiver_id = auth.uid())
  );

create policy "own events" on care_events
  for all using (
    loved_one_id in (select id from loved_ones where caregiver_id = auth.uid())
  );

-- Stream care_events to subscribed clients in real time.
alter publication supabase_realtime add table care_events;

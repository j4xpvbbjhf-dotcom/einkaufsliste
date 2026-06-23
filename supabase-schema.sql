-- =============================================================
--  Einkaufsliste — Supabase Schema
--  Einmal im Supabase SQL Editor ausführen (Dashboard -> SQL Editor -> New query).
-- =============================================================

-- Eine Zeile pro geteilter Liste. Die ganze Liste steckt als JSON in "data".
create table if not exists public.lists (
  id          text primary key,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Realtime aktivieren, damit alle Geräte Änderungen live bekommen.
alter publication supabase_realtime add table public.lists;

-- Row Level Security an, aber bewusst offen:
-- Jede:r mit der App-Adresse darf die Liste lesen und schreiben.
-- Das ist die "Zugriff per Link"-Variante — passend für einen Haushalt.
alter table public.lists enable row level security;

drop policy if exists "lists offen lesen" on public.lists;
create policy "lists offen lesen"
  on public.lists for select
  using (true);

drop policy if exists "lists offen schreiben" on public.lists;
create policy "lists offen schreiben"
  on public.lists for insert
  with check (true);

drop policy if exists "lists offen aktualisieren" on public.lists;
create policy "lists offen aktualisieren"
  on public.lists for update
  using (true) with check (true);

-- Hinweis: Wer die Liste wirklich privat braucht, ersetzt diese offenen
-- Policies später durch echten Login (Supabase Auth, Magic Link). Für den
-- Start ist „wer die Adresse kennt, darf mitschreiben" am einfachsten.

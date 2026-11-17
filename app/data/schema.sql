-- NaijaPocket future account schema for Neon's free Postgres tier.
-- THIS FILE IS NOT EXECUTED. The app does not connect to Neon or any database.
-- Today every record lives in IndexedDB on the user's device (see app/js/db.js).
--
-- When accounts are added, sync one device document to one row.
-- Keep user-written prices, jobs and care places distinct from anything a
-- moderator later marks verified. The client must not be allowed to set
-- verified = true.

-- create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Generic document mirror. One row per IndexedDB record.
-- store is the IndexedDB store name (budgets, prices, opportunities, ...).
-- body is the same JSON the device already saves.
create table if not exists documents (
  user_id uuid not null references users (id) on delete cascade,
  store text not null,
  doc_id text not null,
  body jsonb not null,
  client_updated_at timestamptz not null,
  server_updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, store, doc_id)
);

create index if not exists documents_store_idx on documents (user_id, store);

-- Optional checked view for prices. Read it in SQL later; do not treat
-- kind = 'example' as a quotation.
create or replace view price_entries as
select
  user_id,
  doc_id,
  body->>'item' as item,
  (body->>'amount')::numeric as amount,
  body->>'unit' as unit,
  body->>'place' as place,
  body->>'area' as area,
  body->>'date' as noted_on,
  body->>'kind' as kind,
  body->>'note' as note,
  deleted_at
from documents
where store = 'prices';

comment on table documents is
  'Future sync target. Not used by the GitHub Pages app. verified must be set only by a trusted server job, never by the browser.';

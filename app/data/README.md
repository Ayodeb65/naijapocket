# NaijaPocket data layer

The app is a static site. It has no backend. Every note a person types stays in **IndexedDB** in their browser, database name `naijapocket`.

Nothing in the app calls Neon, Supabase, or any other database. `schema.sql` is a sketch for later, not a live connection.

## Stores

| Store | What it holds | Single record? |
|---|---|---|
| `meta` | App flags such as `seeded` | id `app` |
| `profile` | Name, state, city, household, interests, business name | id `me` |
| `cv` | CV fields | id `me` |
| `budgets` | One monthly budget: income, category plans, expenses | many |
| `plans` | Latest weekly food plan | id `latest` |
| `prices` | Market notes the person typed, plus labelled examples | many |
| `lists` | Shopping lists | many |
| `goals` | Savings goals and contributions | many |
| `challenges` | 30-day savings tick-list | id `current` |
| `opportunities` | Jobs and other openings the person saved, plus labelled examples | many |
| `applications` | Application tracker | many |
| `sales` | Business sales | many |
| `expenses` | Business expenses | many |
| `invoices` | Receipts the person created | many |
| `reminders` | Health reminders the person wrote | many |
| `places` | Care places the person saved | many |
| `reports` | Scam notes kept on the device only | many |
| `checks` | Recent message checks | many |

Code: `app/js/db.js` opens the database and reads or writes whole records. `app/js/logic.js` does the maths and does not touch storage.

## Labels that must stay honest

- Prices use `kind`: `example`, `entry`, or `estimate`. Basket totals ignore `example`. The app never writes `verified`.
- Opportunities use `kind`: `example` or `yours`. A user-typed listing is not verified.
- Care places may have `example: true`. They are not a directory of real clinics.
- Seed amounts are ₦100 placeholders. See `buildSeed()` in `logic.js`.

## Backup

Profile → Your data can export every store as one JSON file and import it back on the same phone. Clearing the browser deletes the data. There is no copy on a server.

## Later: accounts on Neon

Neon's free Postgres tier is a reasonable future host because the app can stay a static site and talk to Postgres through a small free server or serverless function you add then. Do not add that server until you are ready to run auth, rate limits and backups.

Suggested shape (already written in `schema.sql`):

1. A `users` table.
2. A `documents` table: `user_id`, `store`, `doc_id`, `body jsonb`, timestamps, `deleted_at`.
3. The browser keeps writing IndexedDB first, then (later) pushes changed documents.
4. Verification of a price or a job is a server-side flag. The browser must not be able to set it.
5. Safety and health education stay free. Do not put them behind a paid row.

Payment, if it comes, stays out of this database sketch until a provider that does not need a card on day one is chosen and checked. The app currently only links premium buttons to the landing-page waitlist.

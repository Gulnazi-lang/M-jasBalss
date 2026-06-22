# MājasBalss.lv

Digitālā platforma daudzdzīvokļu māju pārvaldībai Latvijā.

Iedzīvotāji var ziņot par problēmām, piedalīties balsojumos un piekļūt sapulču protokoliem.

## Tech

- Next.js 16 (App Router) + TypeScript + Tailwind
- Supabase (Auth, Postgres, Storage)
- next-intl (LV / RU / EN)

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — middleware redirects to /lv (pēc noklusējuma).

## Supabase setup (obligāti)

1. Izveido jaunu Supabase projektu (https://supabase.com)
2. Nokopē `.env.example` uz `.env.local` un ievieto atslēgas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Palaid SQL migrācijas Supabase SQL Editor:
   - `supabase/migrations/001_init_schema.sql`
   - `supabase/migrations/002_seed_demo.sql` (demo dati)
4. Authentication → Providers → Email ieslēgts (iespējams arī Magic Link)
5. Pēc pirmās reģistrācijas izveido `residents` ierakstu manuāli (saistot `user_id` ar `houses`).

## Galvenās lapas

- `/[locale]` — Mājas lapa ar adresi (galvenā)
- `/problems` — Problēmu pieteikumi
- `/polls` — Balsojumi
- `/protocols` — Protokoli
- `/residents` — Iedzīvotāji
- `/auth/login` un `/auth/register`

## Mobilais

- Pilnībā responsīvs
- Apakšējā navigācija (BottomNav) mobilajās ierīcēs

## Nākamie soļi (reāla integrācija)

- Savienot Supabase queries (server + client components)
- Pēc signup izveidot resident profilu
- RLS + autentifikācijas aizsardzība
- Failu augšupielāde (problēmu fotogrāfijas)
- Reāllaika atjauninājumi

---

MājasBalss — katrs balss ir svarīgs 🏠

# NotenPilot Supabase database

This repository is connected to the existing Supabase project:

- Project ref: `jfbcknzaqskuyrlhakoi`
- API URL: `https://jfbcknzaqskuyrlhakoi.supabase.co`
- Region: `ap-south-1`

## Schema

The database supports the current React + Vite + TypeScript app.

| Table | Purpose |
| --- | --- |
| `profiles` | Student account profile |
| `subjects` | Personal school subjects and target grades |
| `student_notes` | Notes, subject links, and pinned state |
| `saved_grades` | Saved grade calculations and JSON breakdown |
| `exams` | Exam dates, subject links, and weights |
| `study_tasks` | Study planner tasks and completion state |
| `flashcard_decks` | Flashcard collections |
| `flashcards` | Questions, answers, and learning status |
| `study_sessions` | Focus/Pomodoro session history |

## Migrations

Apply migrations in timestamp order:

1. `20261025174728_complete_notenpilot_student_features.sql` — schema baseline, indexes, RLS, grants, and profile-on-signup trigger.
2. `20261113101443_harden_user_owned_relations.sql` — composite foreign keys that ensure linked subjects, exams, tasks, decks, and cards belong to the same user.

The first migration timestamp is aligned with the production Supabase migration history. The second migration is already applied to the connected production database.

## Security model

- RLS is enabled on every table in the exposed `public` schema.
- Anonymous users have no table privileges on student data.
- Authenticated users receive CRUD privileges, with RLS restricting rows to `auth.uid() = user_id` (or `auth.uid() = id` for profiles).
- Profile rows are created by the `on_auth_user_created` trigger.
- Composite owner-aware foreign keys prevent linking a note, exam, deck, task, or flashcard to another user's parent record.
- No service-role or secret key belongs in browser code. The frontend uses the publishable key only.

## Frontend configuration

The client reads:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

The current app contains safe public defaults for this project's URL and publishable key in `src/lib/supabase.ts`. A publishable key is expected to be public; database security depends on RLS and table privileges, not on hiding this key.

## Auth dashboard setting still to review

Supabase's security advisor currently reports that leaked-password protection is disabled. Enable it in the Supabase Auth password/security settings. This is a dashboard setting and was not changed by the database migrations.

## Verification performed

- Confirmed all nine tables exist and have RLS enabled.
- Confirmed anonymous table privileges are false and authenticated CRUD privileges are granted.
- Confirmed the signup profile trigger exists and uses an empty `search_path` with schema-qualified references.
- Checked all existing note/subject, exam/subject, deck/subject, task/exam, and flashcard/deck links before adding composite foreign keys; each mismatch count was zero.
- Re-queried the foreign keys and repeated the relationship integrity checks after applying the new migration.
- Re-ran Supabase security advisors. The only reported warning is leaked-password protection being disabled.

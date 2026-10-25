# NotenPilot — Full-Stack Student Platform Blueprint

A complete architectural and design blueprint to elevate NotenPilot into a full-stack, German-first educational platform for school and university students, integrating Supabase authentication, secure cloud-saved notes, subject and exam planning, flashcards, and a focus timer while keeping the existing public grade calculator 100% accessible without login.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Architecture Decisions & Alignment:**
>
> 1. **Public vs. Authenticated Experience**: The existing public German grade calculator, informational guides, FAQs, and legal pages (`impressum.html`, `datenschutz.html`, `kontakt.html`, `404.html`) will remain completely accessible without requiring registration or login. Authenticated features (Student Dashboard, Cloud Notes, Subject Manager, Saved Grade History, Exam Planner, Flashcards, and Focus Timer) live in a dedicated, protected student workspace.
> 2. **Supabase Integration & Zero-Credential Leakage**: Configured strictly through `VITE_SUPABASE_URL` (`https://jfbcknzaqskuyrlhakoi.supabase.co`) and `VITE_SUPABASE_PUBLISHABLE_KEY`. Service role keys and secrets are prohibited from client code. If live keys are not yet configured in local environment variables, the platform provides seamless graceful local persistence with instant sync capability.
> 3. **Non-Destructive Database Migrations**: All Supabase schema enhancements (`profiles`, `student_notes`, `subjects`, `saved_grades`, `exams_and_tasks`, `flashcards`, `study_sessions`) are written as incremental, version-controlled SQL files with strict Row Level Security (RLS) policies ensuring users never access other students' records.

---

## 1. Overview & Core Concept

- **What It Does**: NotenPilot evolves from a standalone calculator into an all-in-one student operating system: calculate grades, save grade targets by subject, manage study notes with tags and favorites, plan upcoming exam deadlines, study with interactive flashcards, and maintain focus with a Pomodoro timer.
- **Target Audience / Persona**: German secondary school students (Gymnasium, Realschule, Gesamtschule), Abitur candidates, and university students seeking a fast, distraction-free, privacy-respecting academic companion.
- **Key Value**: Fast calculations remain zero-friction for casual visitors, while registered students gain an integrated personal study suite that syncs safely across desktop and mobile devices.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Guest Public Flow**:
   - Visitor arrives at NotenPilot $\to$ accesses the high-speed German grade calculator (simple or weighted mode).
   - Enter grades ($1,0$ to $6,0$, supporting comma and dot) $\to$ instant calculation with verbal rating and breakdown table.
   - Optional: "Ergebnis kopieren" for clipboard export, or "Im NotenPilot-Konto speichern" which prompts login/signup to persist the calculation.
2. **Authentication Flow**:
   - Sign up with email/password $\to$ instant session creation (or email confirmation notice if enabled in Supabase).
   - Persistent session with automatic profile initialization in `public.profiles`.
   - Clear password reset and recovery workflows with German guidance.
3. **Student Workspace & Notes Manager**:
   - Sidebar/Top navigation: **Übersicht (Dashboard)**, **Notizen (Notes)**, **Fächer & Noten (Subjects & Grades)**, **Lernplan (Study Planner)**, **Karteikarten (Flashcards)**, and **Fokus-Timer**.
   - Create, edit, search, pin/favorite, and filter notes by subject with instant debounced cloud save.
   - Safe rendering of markdown notes without raw HTML injection.
4. **Study Planner & Flashcards**:
   - Add exams with target dates, subject tagging, and checklist tasks.
   - Interactive flashcard flip-deck with difficulty markers ("Noch üben" vs. "Gelernt").
   - Integrated Pomodoro focus timer with audible chime and session logs.

### Visual Identity & Theme

- **Aesthetic Direction**: Calm, trustworthy educational design with clean Scandinavian and Bauhaus restraint. Zero AI-slop (no purple neon gradients, floating glow spheres, or fake metric tickers).
- **Color Palette (60-30-10 Rule)**:
  - *Dominant Canvas (60%)*: Clean background `#F5F8FC` (light) and soft structural cards `#FFFFFF`.
  - *Structural Surfaces (30%)*: Deep Navy `#123B70` headers, hairline slate borders `#DCE3EC`, and muted secondary typography `#5C6675`.
  - *Accent Budget (10%)*: Academic Emerald `#176B48` for verified results and success states, Warm Amber `#945B00` for deadlines, and Crimson `#9F2525` for errors.
- **Typography**: Clean humanist sans (`Plus Jakarta Sans` or system UI font stack) paired with tabular numerals (`tabular-nums`) for all grades, timestamps, and timer readouts.
- **Accessibility & Mobile Touch**:
  - Touch targets $\ge 44\text{px}$ on mobile screens.
  - Full keyboard accessibility with visible high-contrast focus rings (`outline: 3px solid #123B70`).
  - Screen-reader announcements via `role="alert"` and `aria-live="polite"`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: React Single-Page Application (SPA) with Seamless Static Route Fallback**:
  - *Chosen Approach*: Mount the full-stack student platform with React 19 on Vite while ensuring static entry points (`index.html`, `impressum.html`, `datenschutz.html`, `kontakt.html`, `404.html`) continue functioning out-of-the-box.
  - *Why*: Delivers instant page transitions, reactive state for notes/planner/timer, and rock-solid SEO/crawler access for public pages.
  - *Alternatives Considered*: Multi-page PHP/HTML was rejected due to cumbersome state sharing and lack of real-time cloud sync.
- **Decision 2: Supabase with Strict Row-Level Security (RLS)**:
  - *Chosen Approach*: All user tables (`profiles`, `student_notes`, `subjects`, `saved_grades`, `exams`, `study_tasks`, `flashcard_decks`, `flashcards`) enforce RLS policies bound strictly to `auth.uid() = user_id`.
  - *Why*: Eliminates any possibility of cross-student data leakage even if a query is malformed.
  - *Alternatives Considered*: Storing everything in browser `localStorage` prevents cross-device sync; plain REST backend requires maintaining dedicated server authentication.
- **Decision 3: AdSense & Privacy Integrity**:
  - *Chosen Approach*: Non-intrusive placeholder slots with clear "Anzeige" labels; advertising remains disabled until verified publisher code and a GDPR-compliant consent manager (CMP) are configured. Local calculator privacy claims are cleanly updated to explain that saved cloud notes are stored securely on Supabase.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              NotenPilot                                │
├───────────────────────────────────┬────────────────────────────────────┤
│         Public Experience         │    Authenticated Student Portal    │
│  (Zero Login Required / Fast SEO) │  (Protected by Supabase Auth RLS)  │
├───────────────────────────────────┼────────────────────────────────────┤
│  • Public Grade Calculator        │  • Student Dashboard Overview      │
│  • German Grading Scale Guides    │  • Cloud Notes Manager (CRUD)      │
│  • Educational FAQs & Formula     │  • Subject Manager & Grade Target  │
│  • Legal Pages (Impressum/DSGVO)  │  • Exam & Study Task Planner       │
│  • Ad Slot (Pre-configured)       │  • Flashcards & Pomodoro Timer     │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
       ┌─────────────────────┐              ┌─────────────────────┐
       │   Client Browser    │              │  Supabase Database  │
       │ Local Math & Cache  │              │ PostgreSQL + Auth   │
       │ (calculator-core.ts)│              │  Row-Level Security │
       └─────────────────────┘              └─────────────────────┘
```

### Database Schema (SQL Migrations)

```sql
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  school_type TEXT DEFAULT 'Gymnasium',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_grade NUMERIC(3,2),
  color TEXT DEFAULT '#123B70',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Student Notes Table
CREATE TABLE IF NOT EXISTS public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Saved Grade Calculations Table
CREATE TABLE IF NOT EXISTS public.saved_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  average NUMERIC(3,2) NOT NULL,
  is_weighted BOOLEAN DEFAULT FALSE,
  total_notes INTEGER NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Exams & Study Tasks Table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam_date DATE NOT NULL,
  weight NUMERIC(3,2) DEFAULT 1.0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Flashcard Decks & Cards
CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status TEXT DEFAULT 'learning', -- 'learning' or 'mastered'
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Enforcement on Every Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Sample Standard RLS Policy (repeated for each entity)
CREATE POLICY "Users can only manage own student notes"
  ON public.student_notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## 5. Implementation Sequence & Execution Plan

1. **Step 1: Dependencies & Supabase Client**: Install `@supabase/supabase-js`, create `src/lib/supabase.ts` with connection verification and graceful offline fallback.
2. **Step 2: Authentication Context & Auth Modal**: Build German authentication system (Login, Registrierung, Passwort vergessen) with session listener and protected route wrappers.
3. **Step 3: Integrated Navigation & View Router**: Wire top bar navigation allowing users to seamlessly transition between the public calculator and the student workspace.
4. **Step 4: Student Dashboard & Notes Manager**: Implement rich Notes CRUD with subject tagging, search, pin/unpin, and Markdown preview.
5. **Step 5: Subjects & Saved Grade History**: Enable logged-in users to save calculations directly from the calculator into their permanent subject grade history.
6. **Step 6: Exam Planner & Study Tasks**: Build calendar/list view with countdown days, completion status, and overdue flags.
7. **Step 7: Flashcards & Pomodoro Focus Timer**: Implement card flip study sessions and customizable 25/5 min focus timer.
8. **Step 8: Privacy Disclosures & Quality Assurance**: Update legal documentation to reflect cloud storage, verify all unit tests pass, and compile cleanly.

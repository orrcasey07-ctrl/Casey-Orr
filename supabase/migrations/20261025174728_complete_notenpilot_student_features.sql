-- NotenPilot database baseline.
-- This migration matches the production migration version:
-- 20261025174728_complete_notenpilot_student_features
-- The following schema is the reproducible baseline for a fresh database.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  display_name text,
  school_type text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_grade numeric,
  color text NOT NULL DEFAULT '#123B70',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  subject text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  is_pinned boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.saved_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  average numeric NOT NULL,
  is_weighted boolean NOT NULL DEFAULT false,
  total_notes integer NOT NULL DEFAULT 0,
  breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  exam_date date NOT NULL,
  weight numeric NOT NULL DEFAULT 1,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid REFERENCES public.exams(id) ON DELETE SET NULL,
  title text NOT NULL,
  due_date date,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id uuid NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  status text NOT NULL DEFAULT 'learning'
    CHECK (status IN ('learning', 'mastered')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  session_type text NOT NULL DEFAULT 'pomodoro',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Common user-scoped lookup and ordering indexes.
CREATE INDEX IF NOT EXISTS subjects_user_id_idx
  ON public.subjects (user_id);
CREATE INDEX IF NOT EXISTS student_notes_user_id_idx
  ON public.student_notes (user_id);
CREATE INDEX IF NOT EXISTS student_notes_user_created_at_idx
  ON public.student_notes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS saved_grades_user_created_at_idx
  ON public.saved_grades (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS exams_user_date_idx
  ON public.exams (user_id, exam_date);
CREATE INDEX IF NOT EXISTS exams_subject_id_idx
  ON public.exams (subject_id);
CREATE INDEX IF NOT EXISTS study_tasks_user_due_date_idx
  ON public.study_tasks (user_id, due_date);
CREATE INDEX IF NOT EXISTS study_tasks_exam_id_idx
  ON public.study_tasks (exam_id);
CREATE INDEX IF NOT EXISTS flashcard_decks_user_created_at_idx
  ON public.flashcard_decks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS flashcard_decks_subject_id_idx
  ON public.flashcard_decks (subject_id);
CREATE INDEX IF NOT EXISTS flashcards_user_deck_idx
  ON public.flashcards (user_id, deck_id);
CREATE INDEX IF NOT EXISTS flashcards_deck_id_idx
  ON public.flashcards (deck_id);
CREATE INDEX IF NOT EXISTS study_sessions_user_created_at_idx
  ON public.study_sessions (user_id, created_at DESC);

-- All student data is private and protected by RLS.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.subjects FROM anon;
REVOKE ALL ON public.student_notes FROM anon;
REVOKE ALL ON public.saved_grades FROM anon;
REVOKE ALL ON public.exams FROM anon;
REVOKE ALL ON public.study_tasks FROM anon;
REVOKE ALL ON public.flashcard_decks FROM anon;
REVOKE ALL ON public.flashcards FROM anon;
REVOKE ALL ON public.study_sessions FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users manage own subjects" ON public.subjects;
CREATE POLICY "Users manage own subjects" ON public.subjects
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can read their own notes" ON public.student_notes;
CREATE POLICY "Users can read their own notes" ON public.student_notes
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own notes" ON public.student_notes;
CREATE POLICY "Users can create their own notes" ON public.student_notes
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.student_notes;
CREATE POLICY "Users can update their own notes" ON public.student_notes
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.student_notes;
CREATE POLICY "Users can delete their own notes" ON public.student_notes
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own saved_grades" ON public.saved_grades;
CREATE POLICY "Users manage own saved_grades" ON public.saved_grades
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own exams" ON public.exams;
CREATE POLICY "Users manage own exams" ON public.exams
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own study_tasks" ON public.study_tasks;
CREATE POLICY "Users manage own study_tasks" ON public.study_tasks
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own flashcard_decks" ON public.flashcard_decks;
CREATE POLICY "Users manage own flashcard_decks" ON public.flashcard_decks
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own flashcards" ON public.flashcards;
CREATE POLICY "Users manage own flashcards" ON public.flashcards
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users manage own study_sessions" ON public.study_sessions;
CREATE POLICY "Users manage own study_sessions" ON public.study_sessions
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Create profiles automatically when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

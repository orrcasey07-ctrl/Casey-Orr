-- Harden user-owned relationships so a signed-in user can only link
-- their records to their own subjects, exams, and flashcard decks.
-- Existing child data was checked before applying this migration.

CREATE UNIQUE INDEX IF NOT EXISTS subjects_id_user_id_uidx
  ON public.subjects (id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS exams_id_user_id_uidx
  ON public.exams (id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS flashcard_decks_id_user_id_uidx
  ON public.flashcard_decks (id, user_id);

-- Replace single-column relationships with composite owner-aware foreign keys.
ALTER TABLE public.student_notes
  DROP CONSTRAINT IF EXISTS student_notes_subject_id_fkey;
ALTER TABLE public.exams
  DROP CONSTRAINT IF EXISTS exams_subject_id_fkey;
ALTER TABLE public.flashcard_decks
  DROP CONSTRAINT IF EXISTS flashcard_decks_subject_id_fkey;
ALTER TABLE public.study_tasks
  DROP CONSTRAINT IF EXISTS study_tasks_exam_id_fkey;
ALTER TABLE public.flashcards
  DROP CONSTRAINT IF EXISTS flashcards_deck_id_fkey;

ALTER TABLE public.student_notes
  ADD CONSTRAINT student_notes_subject_owner_fkey
  FOREIGN KEY (subject_id, user_id)
  REFERENCES public.subjects (id, user_id)
  ON DELETE SET NULL (subject_id);

ALTER TABLE public.exams
  ADD CONSTRAINT exams_subject_owner_fkey
  FOREIGN KEY (subject_id, user_id)
  REFERENCES public.subjects (id, user_id)
  ON DELETE SET NULL (subject_id);

ALTER TABLE public.flashcard_decks
  ADD CONSTRAINT flashcard_decks_subject_owner_fkey
  FOREIGN KEY (subject_id, user_id)
  REFERENCES public.subjects (id, user_id)
  ON DELETE SET NULL (subject_id);

ALTER TABLE public.study_tasks
  ADD CONSTRAINT study_tasks_exam_owner_fkey
  FOREIGN KEY (exam_id, user_id)
  REFERENCES public.exams (id, user_id)
  ON DELETE SET NULL (exam_id);

ALTER TABLE public.flashcards
  ADD CONSTRAINT flashcards_deck_owner_fkey
  FOREIGN KEY (deck_id, user_id)
  REFERENCES public.flashcard_decks (id, user_id)
  ON DELETE CASCADE;

-- Index referencing columns to keep owner-scoped lookups and FK checks efficient.
CREATE INDEX IF NOT EXISTS student_notes_subject_owner_idx
  ON public.student_notes (subject_id, user_id);
CREATE INDEX IF NOT EXISTS exams_subject_owner_idx
  ON public.exams (subject_id, user_id);
CREATE INDEX IF NOT EXISTS flashcard_decks_subject_owner_idx
  ON public.flashcard_decks (subject_id, user_id);
CREATE INDEX IF NOT EXISTS study_tasks_exam_owner_idx
  ON public.study_tasks (exam_id, user_id);
CREATE INDEX IF NOT EXISTS flashcards_deck_owner_idx
  ON public.flashcards (deck_id, user_id);

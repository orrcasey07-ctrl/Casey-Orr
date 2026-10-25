import { supabase, isSupabaseConfigured, Subject, StudentNote, SavedGrade, Exam, StudyTask, FlashcardDeck, Flashcard, StudySession } from './supabase';
export type { Subject, StudentNote, SavedGrade, Exam, StudyTask, FlashcardDeck, Flashcard, StudySession };

// Local storage helper
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// ==========================================
// 1. SUBJECTS SERVICE
// ==========================================
export const getSubjects = async (userId: string): Promise<Subject[]> => {
  if (!isSupabaseConfigured) {
    const list = getLocal<Subject[]>(`notenpilot_subjects_${userId}`, [
      { id: 'sub-1', user_id: userId, name: 'Mathematik', target_grade: 2.0, color: '#123B70', created_at: new Date().toISOString() },
      { id: 'sub-2', user_id: userId, name: 'Deutsch', target_grade: 1.7, color: '#176B48', created_at: new Date().toISOString() },
      { id: 'sub-3', user_id: userId, name: 'Englisch', target_grade: 2.3, color: '#855302', created_at: new Date().toISOString() },
    ]);
    return list;
  }

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data as Subject[]) || [];
};

export const createSubject = async (userId: string, name: string, targetGrade: number | null, color: string): Promise<Subject> => {
  if (!isSupabaseConfigured) {
    const subjects = await getSubjects(userId);
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      user_id: userId,
      name,
      target_grade: targetGrade,
      color,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_subjects_${userId}`, [...subjects, newSubject]);
    return newSubject;
  }

  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: userId, name, target_grade: targetGrade, color })
    .select()
    .single();

  if (error) throw error;
  return data as Subject;
};

export const deleteSubject = async (userId: string, subjectId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const subjects = await getSubjects(userId);
    setLocal(`notenpilot_subjects_${userId}`, subjects.filter(s => s.id !== subjectId));
    return;
  }

  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', subjectId)
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 2. STUDENT NOTES SERVICE
// ==========================================
export const getNotes = async (userId: string): Promise<StudentNote[]> => {
  if (!isSupabaseConfigured) {
    return getLocal<StudentNote[]>(`notenpilot_notes_${userId}`, [
      {
        id: 'note-1',
        user_id: userId,
        subject_id: 'sub-1',
        title: 'Formelsammlung Integralrechnung',
        content: 'Grundintegrale:\n- ∫ x^n dx = (x^(n+1))/(n+1) + C\n- ∫ e^x dx = e^x + C\n- Partielle Integration: ∫ u v\' = u v - ∫ u\' v',
        is_pinned: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'note-2',
        user_id: userId,
        subject_id: 'sub-2',
        title: 'Gedichtanalyse Epochenmerkmale',
        content: 'Romantik (ca. 1795–1848):\n- Motive: Sehnsucht, Wanderschaft, Nacht, Naturverbundenheit, das Blaue Blume Symbol.\n- Sprache: Musikalisch, volksliedhaft.',
        is_pinned: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ]);
  }

  const { data, error } = await supabase
    .from('student_notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data as StudentNote[]) || [];
};

export const createNote = async (
  userId: string,
  title: string,
  content: string,
  subjectId: string | null,
  isPinned = false
): Promise<StudentNote> => {
  if (!isSupabaseConfigured) {
    const notes = await getNotes(userId);
    const newNote: StudentNote = {
      id: `note-${Date.now()}`,
      user_id: userId,
      subject_id: subjectId,
      title,
      content,
      is_pinned: isPinned,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_notes_${userId}`, [newNote, ...notes]);
    return newNote;
  }

  const { data, error } = await supabase
    .from('student_notes')
    .insert({
      user_id: userId,
      title,
      content,
      subject_id: subjectId,
      is_pinned: isPinned,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as StudentNote;
};

export const updateNote = async (
  userId: string,
  noteId: string,
  updates: Partial<Pick<StudentNote, 'title' | 'content' | 'subject_id' | 'is_pinned'>>
): Promise<StudentNote> => {
  if (!isSupabaseConfigured) {
    const notes = await getNotes(userId);
    const updated = notes.map(n => n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n);
    setLocal(`notenpilot_notes_${userId}`, updated);
    return updated.find(n => n.id === noteId)!;
  }

  const { data, error } = await supabase
    .from('student_notes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as StudentNote;
};

export const deleteNote = async (userId: string, noteId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const notes = await getNotes(userId);
    setLocal(`notenpilot_notes_${userId}`, notes.filter(n => n.id !== noteId));
    return;
  }

  const { error } = await supabase
    .from('student_notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 3. SAVED GRADE CALCULATIONS SERVICE
// ==========================================
export const getSavedGrades = async (userId: string): Promise<SavedGrade[]> => {
  if (!isSupabaseConfigured) {
    return getLocal<SavedGrade[]>(`notenpilot_saved_grades_${userId}`, [
      {
        id: 'grade-1',
        user_id: userId,
        title: 'Halbjahreszeugnis 11/1',
        average: 2.15,
        is_weighted: true,
        total_notes: 4,
        breakdown: [
          { subject: 'Mathematik', grade: 2.0, weight: 2 },
          { subject: 'Deutsch', grade: 1.7, weight: 1 },
          { subject: 'Englisch', grade: 2.3, weight: 1 },
          { subject: 'Physik', grade: 2.7, weight: 1 },
        ],
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ]);
  }

  const { data, error } = await supabase
    .from('saved_grades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as SavedGrade[]) || [];
};

export const saveGradeCalculation = async (
  userId: string,
  title: string,
  average: number,
  isWeighted: boolean,
  breakdown: Array<{ subject: string; grade: number; weight: number }>
): Promise<SavedGrade> => {
  if (!isSupabaseConfigured) {
    const list = await getSavedGrades(userId);
    const newEntry: SavedGrade = {
      id: `grade-${Date.now()}`,
      user_id: userId,
      title,
      average,
      is_weighted: isWeighted,
      total_notes: breakdown.length,
      breakdown,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_saved_grades_${userId}`, [newEntry, ...list]);
    return newEntry;
  }

  const { data, error } = await supabase
    .from('saved_grades')
    .insert({
      user_id: userId,
      title,
      average,
      is_weighted: isWeighted,
      total_notes: breakdown.length,
      breakdown,
    })
    .select()
    .single();

  if (error) throw error;
  return data as SavedGrade;
};

export const deleteSavedGrade = async (userId: string, gradeId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const list = await getSavedGrades(userId);
    setLocal(`notenpilot_saved_grades_${userId}`, list.filter(g => g.id !== gradeId));
    return;
  }

  const { error } = await supabase
    .from('saved_grades')
    .delete()
    .eq('id', gradeId)
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 4. EXAMS & STUDY TASKS SERVICE
// ==========================================
export const getExams = async (userId: string): Promise<Exam[]> => {
  if (!isSupabaseConfigured) {
    const today = new Date();
    const inFiveDays = new Date(today.getTime() + 86400000 * 5).toISOString().split('T')[0];
    const inTwelveDays = new Date(today.getTime() + 86400000 * 12).toISOString().split('T')[0];

    return getLocal<Exam[]>(`notenpilot_exams_${userId}`, [
      {
        id: 'exam-1',
        user_id: userId,
        subject_id: 'sub-1',
        title: 'Mathematik Klausur 2 (Analysis & Kurvendiskussion)',
        exam_date: inFiveDays,
        weight: 2.0,
        description: 'Schwerpunkte: Ableitungsregeln, Extremstellen, Wendepunkte',
        created_at: new Date().toISOString(),
      },
      {
        id: 'exam-2',
        user_id: userId,
        subject_id: 'sub-2',
        title: 'Deutsch Klausur (Sachtextanalyse)',
        exam_date: inTwelveDays,
        weight: 1.0,
        description: 'Argumentationsstrukturen und rhetorische Mittel',
        created_at: new Date().toISOString(),
      },
    ]);
  }

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('user_id', userId)
    .order('exam_date', { ascending: true });

  if (error) throw error;
  return (data as Exam[]) || [];
};

export const createExam = async (
  userId: string,
  title: string,
  examDate: string,
  subjectId: string | null,
  weight: number,
  description = ''
): Promise<Exam> => {
  if (!isSupabaseConfigured) {
    const exams = await getExams(userId);
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      user_id: userId,
      subject_id: subjectId,
      title,
      exam_date: examDate,
      weight,
      description,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_exams_${userId}`, [...exams, newExam]);
    return newExam;
  }

  const { data, error } = await supabase
    .from('exams')
    .insert({
      user_id: userId,
      title,
      exam_date: examDate,
      subject_id: subjectId,
      weight,
      description,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Exam;
};

export const deleteExam = async (userId: string, examId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const exams = await getExams(userId);
    setLocal(`notenpilot_exams_${userId}`, exams.filter(e => e.id !== examId));
    return;
  }

  const { error } = await supabase
    .from('exams')
    .delete()
    .eq('id', examId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getStudyTasks = async (userId: string): Promise<StudyTask[]> => {
  if (!isSupabaseConfigured) {
    const today = new Date().toISOString().split('T')[0];
    return getLocal<StudyTask[]>(`notenpilot_tasks_${userId}`, [
      { id: 'task-1', user_id: userId, exam_id: 'exam-1', title: 'Übungsaufgaben Buch S. 84 Nr. 1-6 lösen', due_date: today, is_completed: false, created_at: new Date().toISOString() },
      { id: 'task-2', user_id: userId, exam_id: 'exam-1', title: 'Spickzettel für Formeln schreiben', due_date: today, is_completed: true, created_at: new Date().toISOString() },
      { id: 'task-3', user_id: userId, exam_id: 'exam-2', title: 'Musteraufsatz Einleitung üben', due_date: null, is_completed: false, created_at: new Date().toISOString() },
    ]);
  }

  const { data, error } = await supabase
    .from('study_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('is_completed', { ascending: true })
    .order('due_date', { ascending: true });

  if (error) throw error;
  return (data as StudyTask[]) || [];
};

export const createStudyTask = async (
  userId: string,
  title: string,
  examId: string | null,
  dueDate: string | null
): Promise<StudyTask> => {
  if (!isSupabaseConfigured) {
    const tasks = await getStudyTasks(userId);
    const newTask: StudyTask = {
      id: `task-${Date.now()}`,
      user_id: userId,
      exam_id: examId,
      title,
      due_date: dueDate,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_tasks_${userId}`, [newTask, ...tasks]);
    return newTask;
  }

  const { data, error } = await supabase
    .from('study_tasks')
    .insert({
      user_id: userId,
      title,
      exam_id: examId,
      due_date: dueDate,
      is_completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as StudyTask;
};

export const toggleStudyTask = async (userId: string, taskId: string, isCompleted: boolean): Promise<void> => {
  if (!isSupabaseConfigured) {
    const tasks = await getStudyTasks(userId);
    setLocal(`notenpilot_tasks_${userId}`, tasks.map(t => t.id === taskId ? { ...t, is_completed: isCompleted } : t));
    return;
  }

  const { error } = await supabase
    .from('study_tasks')
    .update({ is_completed: isCompleted })
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deleteStudyTask = async (userId: string, taskId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const tasks = await getStudyTasks(userId);
    setLocal(`notenpilot_tasks_${userId}`, tasks.filter(t => t.id !== taskId));
    return;
  }

  const { error } = await supabase
    .from('study_tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 5. FLASHCARDS SERVICE
// ==========================================
export const getDecks = async (userId: string): Promise<FlashcardDeck[]> => {
  if (!isSupabaseConfigured) {
    return getLocal<FlashcardDeck[]>(`notenpilot_decks_${userId}`, [
      { id: 'deck-1', user_id: userId, subject_id: 'sub-3', title: 'Englisch Vokabeln (Advanced C1)', description: 'Wichtige Idioms und essay vocabulary', created_at: new Date().toISOString() },
      { id: 'deck-2', user_id: userId, subject_id: 'sub-1', title: 'Mathe Definitionen', description: 'Grenzwerte, Stetigkeit und Differenzierbarkeit', created_at: new Date().toISOString() },
    ]);
  }

  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as FlashcardDeck[]) || [];
};

export const createDeck = async (userId: string, title: string, description: string, subjectId: string | null): Promise<FlashcardDeck> => {
  if (!isSupabaseConfigured) {
    const decks = await getDecks(userId);
    const newDeck: FlashcardDeck = {
      id: `deck-${Date.now()}`,
      user_id: userId,
      title,
      description,
      subject_id: subjectId,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_decks_${userId}`, [newDeck, ...decks]);
    return newDeck;
  }

  const { data, error } = await supabase
    .from('flashcard_decks')
    .insert({ user_id: userId, title, description, subject_id: subjectId })
    .select()
    .single();

  if (error) throw error;
  return data as FlashcardDeck;
};

export const deleteDeck = async (userId: string, deckId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const decks = await getDecks(userId);
    setLocal(`notenpilot_decks_${userId}`, decks.filter(d => d.id !== deckId));
    return;
  }

  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', deckId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getCards = async (userId: string, deckId: string): Promise<Flashcard[]> => {
  if (!isSupabaseConfigured) {
    return getLocal<Flashcard[]>(`notenpilot_cards_${deckId}`, [
      { id: 'card-1', user_id: userId, deck_id: 'deck-1', question: 'Was bedeutet "ubiquitous"?', answer: 'Allgegenwärtig / überall vorkommend (omnipresent).', status: 'learning', created_at: new Date().toISOString() },
      { id: 'card-2', user_id: userId, deck_id: 'deck-1', question: 'Was bedeutet "to mitigate"?', answer: 'Mildern, abschwächen, lindern.', status: 'mastered', created_at: new Date().toISOString() },
      { id: 'card-3', user_id: userId, deck_id: 'deck-1', question: 'Was bedeutet "paradigm shift"?', answer: 'Paradigmenwechsel / grundlegende Änderung eines Denkmusters.', status: 'learning', created_at: new Date().toISOString() },
    ]);
  }

  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as Flashcard[]) || [];
};

export const createCard = async (userId: string, deckId: string, question: string, answer: string): Promise<Flashcard> => {
  if (!isSupabaseConfigured) {
    const cards = await getCards(userId, deckId);
    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      user_id: userId,
      deck_id: deckId,
      question,
      answer,
      status: 'learning',
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_cards_${deckId}`, [...cards, newCard]);
    return newCard;
  }

  const { data, error } = await supabase
    .from('flashcards')
    .insert({ user_id: userId, deck_id: deckId, question, answer, status: 'learning' })
    .select()
    .single();

  if (error) throw error;
  return data as Flashcard;
};

export const updateCardStatus = async (userId: string, cardId: string, status: 'learning' | 'mastered', deckId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const cards = await getCards(userId, deckId);
    setLocal(`notenpilot_cards_${deckId}`, cards.map(c => c.id === cardId ? { ...c, status } : c));
    return;
  }

  const { error } = await supabase
    .from('flashcards')
    .update({ status })
    .eq('id', cardId)
    .eq('user_id', userId);

  if (error) throw error;
};

export const deleteCard = async (userId: string, cardId: string, deckId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const cards = await getCards(userId, deckId);
    setLocal(`notenpilot_cards_${deckId}`, cards.filter(c => c.id !== cardId));
    return;
  }

  const { error } = await supabase
    .from('flashcards')
    .delete()
    .eq('id', cardId)
    .eq('user_id', userId);

  if (error) throw error;
};

// ==========================================
// 6. STUDY SESSIONS SERVICE (FOCUS TIMER)
// ==========================================
export const logStudySession = async (userId: string, durationMinutes: number, sessionType = 'pomodoro'): Promise<StudySession> => {
  if (!isSupabaseConfigured) {
    const sessions = getLocal<StudySession[]>(`notenpilot_sessions_${userId}`, []);
    const newSession: StudySession = {
      id: `session-${Date.now()}`,
      user_id: userId,
      duration_minutes: durationMinutes,
      session_type: sessionType,
      created_at: new Date().toISOString(),
    };
    setLocal(`notenpilot_sessions_${userId}`, [newSession, ...sessions]);
    return newSession;
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, duration_minutes: durationMinutes, session_type: sessionType })
    .select()
    .single();

  if (error) throw error;
  return data as StudySession;
};

export const getStudySessions = async (userId: string): Promise<StudySession[]> => {
  if (!isSupabaseConfigured) {
    return getLocal<StudySession[]>(`notenpilot_sessions_${userId}`, [
      { id: 's-1', user_id: userId, duration_minutes: 25, session_type: 'pomodoro', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 's-2', user_id: userId, duration_minutes: 25, session_type: 'pomodoro', created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
    ]);
  }

  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as StudySession[]) || [];
};

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  display_name: string | null;
  school_type: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  target_grade: number | null;
  color: string;
  created_at: string;
}

export interface StudentNote {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface SavedGrade {
  id: string;
  user_id: string;
  title: string;
  average: number;
  is_weighted: boolean;
  total_notes: number;
  breakdown: Array<{
    subject: string;
    grade: number;
    weight: number;
  }>;
  created_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  weight: number;
  description: string;
  created_at: string;
}

export interface StudyTask {
  id: string;
  user_id: string;
  exam_id: string | null;
  title: string;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  description: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  deck_id: string;
  question: string;
  answer: string;
  status: 'learning' | 'mastered';
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  duration_minutes: number;
  session_type: string;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jfbcknzaqskuyrlhakoi.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YOR2ryfjt64yZn9V2gLa6A_ir4Z4PMj';

// Validate if a genuine public key is provided (not empty or default placeholder)
export const isSupabaseConfigured = Boolean(
  supabasePublishableKey &&
  !supabasePublishableKey.includes('your-anon-publishable-key-here') &&
  supabasePublishableKey.length > 20
);

// Create the official client if configured, otherwise provide a safe client instance
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabasePublishableKey
);

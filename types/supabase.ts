// types/supabase.ts

export interface Note {
  id: string;
  title: string | null;
  content: string | null;
  grade: string | null;
  subject: string | null;
  unit: string | null;
  is_premium: boolean | null;
  created_at: string | null;
}

// Updated Question type to match your React Native app's data structure
export interface Question {
  id: string;
  question_text: string | null;
  options: string[] | null; // Changed to string array
  correct_answer: string | null; // Remains full text
  subject: string | null;
  grade: string | null;
  created_at: string;
  unit: string | null;
}

export interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  grade: string | null;
  subject: string | null;
  unit: string | null;
  is_premium: boolean | null;
  created_at: string | null;
}

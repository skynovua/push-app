// Shared types for the entire application

export interface WorkoutSession {
  id: string;
  date: Date;
  pushUps: number;
  duration: number; // в секундах
  sets?: Set[];
  goal?: number;
}

export interface Set {
  reps: number;
  restTime: number; // в секундах
  timestamp: Date;
}

export interface DailyStats {
  date: string;
  count: number;
  sessions: number;
  duration: number;
}

export interface BestDay {
  count: number;
  date: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (totalPushUps: number, streak: number, sessions: WorkoutSession[]) => boolean;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface AppSettings {
  dailyGoal: number;
  soundEnabled: boolean;
  darkMode: boolean;
  reminderTime?: string;
  daysOfWeek?: number[]; // 0-6, where 0 is Monday
  autoSave: boolean;
  language: 'ua' | 'en';
}

export interface AppState {
  currentCount: number;
  isActive: boolean;
  sessionStartTime: Date | null;
  elapsedTime: number;
  dailyGoal: number;
  todayPushUps: number;
  settings: AppSettings;
}

export interface ImportData {
  sessions: WorkoutSession[];
  settings?: Partial<AppSettings>;
  exportDate?: string;
  totalPushUps?: number;
  version?: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  duplicates: number;
  errors: string[];
}

export type TimePeriod = 'week' | 'month' | 'year' | 'allTime';

export interface PeriodStats {
  date: string;
  count: number;
  sessions: number;
  duration: number;
  label: string;
}

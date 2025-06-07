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
  autoSave: boolean;
}

export interface AppState {
  currentCount: number;
  isActive: boolean;
  sessionStartTime: Date | null;
  elapsedTime: number;
  dailyGoal: number;
  settings: AppSettings;
}
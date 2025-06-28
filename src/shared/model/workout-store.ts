import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AppSettings, AppState } from '@/shared/domain';

import { dbUtils } from '../lib/database';

interface WorkoutStore extends AppState {
  // Daily stats
  todayPushUps: number;

  // Actions
  incrementCount: () => void;
  resetCount: () => void;
  startSession: () => void;
  pauseSession: () => void;
  endSession: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  setElapsedTime: (time: number) => void;
  resetStore: () => void;
  loadTodayStats: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCount: 0,
      isActive: false,
      sessionStartTime: null,
      elapsedTime: 0,
      dailyGoal: 50,
      todayPushUps: 0,
      settings: {
        dailyGoal: 50,
        soundEnabled: true,
        darkMode: false,
        autoSave: true,
        language: 'ua' as const,
      },

      // Actions
      incrementCount: () => {
        const state = get();
        if (state.isActive) {
          set({ currentCount: state.currentCount + 1 });

          // Play sound if enabled
          if (state.settings.soundEnabled) {
            playClickSound().catch(() => {
              // Silent fail - audio is not critical
            });
          }
        }
      },

      resetCount: () => {
        set({
          currentCount: 0,
          elapsedTime: 0,
          isActive: false,
          sessionStartTime: null,
        });
      },

      startSession: () => {
        set({
          isActive: true,
          sessionStartTime: new Date(),
          elapsedTime: 0,
        });
      },

      pauseSession: () => {
        set({ isActive: false });
      },

      endSession: async () => {
        const state = get();
        if (state.currentCount > 0 && state.sessionStartTime) {
          // Save session to database
          await dbUtils.saveWorkoutSession({
            date: state.sessionStartTime,
            pushUps: state.currentCount,
            duration: state.elapsedTime,
            goal: state.dailyGoal,
          });

          // Update today's stats after saving
          await get().loadTodayStats();
        }

        set({
          currentCount: 0,
          isActive: false,
          sessionStartTime: null,
          elapsedTime: 0,
        });
      },

      updateSettings: async (newSettings: Partial<AppSettings>) => {
        const state = get();
        const updatedSettings = { ...state.settings, ...newSettings };

        set({
          settings: updatedSettings,
          dailyGoal: updatedSettings.dailyGoal,
        });

        await dbUtils.updateSettings(updatedSettings);
      },

      loadSettings: async () => {
        const settings = await dbUtils.getSettings();
        set({
          settings,
          dailyGoal: settings.dailyGoal,
        });
      },

      loadTodayStats: async () => {
        const todaySessions = await dbUtils.getTodaySessions();
        const todayTotal = todaySessions.reduce((total, session) => total + session.pushUps, 0);
        set({ todayPushUps: todayTotal });
      },

      setElapsedTime: (time: number) => {
        set({ elapsedTime: time });
      },

      resetStore: () => {
        set({
          currentCount: 0,
          isActive: false,
          sessionStartTime: null,
          elapsedTime: 0,
          todayPushUps: 0,
        });
      },
    }),
    {
      name: 'workout-store',
      partialize: (state) => ({
        settings: state.settings,
        dailyGoal: state.dailyGoal,
      }),
    }
  )
);

// Audio feedback function with better error handling
let audioContext: AudioContext | null = null;
let isAudioEnabled = true;

const initAudioContext = async (): Promise<AudioContext | null> => {
  if (!isAudioEnabled) return null;

  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    // Resume context if suspended (required by browser policies)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    return audioContext;
  } catch (error) {
    console.warn('Failed to initialize AudioContext:', error);
    isAudioEnabled = false;
    return null;
  }
};

const playClickSound = async () => {
  try {
    // Try Web Audio API first
    const context = await initAudioContext();

    if (context && context.state === 'running') {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(800, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
      return;
    }
  } catch (error) {
    console.warn('Web Audio API failed, trying fallback:', error);
  }

  // Fallback to simple audio beep using data URI
  try {
    const audio = new Audio();
    audio.volume = 0.3;
    // Simple beep sound as data URI
    audio.src =
      'data:audio/wav;base64,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';
    await audio.play();
  } catch (fallbackError) {
    // Silent fail for audio - not critical for app functionality
    console.warn('All audio methods failed:', fallbackError);
  }
};

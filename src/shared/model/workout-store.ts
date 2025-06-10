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
            playClickSound();
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

// Audio feedback function
const playClickSound = () => {
  try {
    const audio = new Audio();
    audio.volume = 0.3;
    // Create a simple click sound using Web Audio API
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { dbUtils } from './database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely clear all user data with confirmation and error handling
 */
export const clearUserDataSafely = async () => {
  try {
    await dbUtils.clearAllData();
    // Also clear localStorage user data while preserving system preferences
    const themePreference = localStorage.getItem('theme');
    const languagePreference = localStorage.getItem('language');

    // Clear only user data
    const keysToRemove = ['workoutData', 'achievementsData'];
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Restore system preferences
    if (themePreference) {
      localStorage.setItem('theme', themePreference);
    }
    if (languagePreference) {
      localStorage.setItem('language', languagePreference);
    }

    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

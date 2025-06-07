import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Безпечно очищає localStorage, зберігаючи важливі системні дані
 * 
 * Проблема: При видаленні всіх даних користувача з налаштувань,
 * додаток втрачав activeTab і редіректив на головну сторінку при оновленні.
 * 
 * Рішення: activeTab тепер зберігається в sessionStorage (не торкаємося),
 * а тут очищуємо тільки користувацькі дані з localStorage.
 */
export function clearUserDataSafely() {
  // Зберігаємо важливі системні преференції
  const themePreference = localStorage.getItem('theme');
  const languagePreference = localStorage.getItem('language');
  
  // Очищуємо тільки користувацькі дані
  const keysToRemove = ['workoutData', 'achievementsData'];
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Відновлюємо важливі системні дані
  if (themePreference) {
    localStorage.setItem('theme', themePreference);
  }
  if (languagePreference) {
    localStorage.setItem('language', languagePreference);
  }
  
  // activeTab тепер в sessionStorage - він автоматично зберігається
}
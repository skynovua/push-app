import Dexie, { type Table } from 'dexie';

import type { Achievement, AppSettings, ImportData, ImportResult, WorkoutSession } from '../domain';

export class AppDB extends Dexie {
  workoutSessions!: Table<WorkoutSession>;
  settings!: Table<AppSettings>;
  achievements!: Table<Achievement>;

  constructor() {
    super('PushUpCounterDB');

    this.version(1).stores({
      workoutSessions: '++id, date, pushUps, duration, goal',
      settings: '++id, dailyGoal, soundEnabled, darkMode, language',
      achievements: '++id, name, unlocked, unlockedDate',
    });
  }
}

export const db = new AppDB();

// Инициализация настроек по умолчанию
export const initializeDefaults = async () => {
  const existingSettings = await db.settings.toArray();

  if (existingSettings.length === 0) {
    await db.settings.add({
      dailyGoal: 50,
      soundEnabled: true,
      darkMode: false,
      autoSave: true,
      language: 'ua',
    } as AppSettings);
  }
};

// Утилиты для работы с базой данных
export const dbUtils = {
  // Сохранить сессию тренировки
  async saveWorkoutSession(session: Omit<WorkoutSession, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.workoutSessions.add({
      ...session,
      id,
    });
    return id;
  },

  // Получить все сессии
  async getAllSessions(): Promise<WorkoutSession[]> {
    return await db.workoutSessions.orderBy('date').reverse().toArray();
  },

  // Получить сессии за определенный период
  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<WorkoutSession[]> {
    return await db.workoutSessions.where('date').between(startDate, endDate, true, true).toArray();
  },

  // Получить сегодняшние сессии
  async getTodaySessions(): Promise<WorkoutSession[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return await this.getSessionsByDateRange(startOfDay, endOfDay);
  },

  // Получить общее количество отжиманий
  async getTotalPushUps(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions.reduce((total, session) => total + session.pushUps, 0);
  },

  // Получить настройки
  async getSettings(): Promise<AppSettings> {
    const settings = await db.settings.toArray();
    return (
      settings[0] ||
      ({
        dailyGoal: 50,
        soundEnabled: true,
        darkMode: false,
        autoSave: true,
        language: 'ua',
        reminderTime: undefined,
        daysOfWeek: undefined,
      } as AppSettings)
    );
  },

  // Обновить настройки
  async updateSettings(newSettings: Partial<AppSettings>): Promise<void> {
    const existing = await this.getSettings();
    await db.settings.clear();
    await db.settings.add({ ...existing, ...newSettings });
  },

  // Получить достижения
  async getAchievements(): Promise<Achievement[]> {
    return await db.achievements.toArray();
  },

  // Разблокировать достижение
  async unlockAchievement(achievementId: string): Promise<void> {
    await db.achievements.where('id').equals(achievementId).modify({
      unlocked: true,
      unlockedDate: new Date(),
    });
  },

  // Видалити конкретну сесію тренування
  async deleteWorkoutSession(sessionId: string): Promise<void> {
    await db.workoutSessions.where('id').equals(sessionId).delete();
  },

  // Видалити кілька сесій за один раз
  async deleteMultipleSessions(sessionIds: string[]): Promise<void> {
    await db.workoutSessions.where('id').anyOf(sessionIds).delete();
  },

  // Видалити всі сесії за певну дату
  async deleteSessionsByDate(date: Date): Promise<void> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    await db.workoutSessions.where('date').between(startOfDay, endOfDay, true, true).delete();
  },

  // Видалити старі сесії (старше певної кількості днів)
  async deleteOldSessions(daysToKeep: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await db.workoutSessions.where('date').below(cutoffDate).delete();
  },

  // Очистити всі дані
  async clearAllData(): Promise<void> {
    await db.workoutSessions.clear();
    await db.achievements.clear();
    // Зберігаємо налаштування, щоб користувач не втратив свої преференції
  },

  // Повне очищення включно з налаштуваннями
  async resetApp(): Promise<void> {
    await db.workoutSessions.clear();
    await db.achievements.clear();
    await db.settings.clear();
    // Ініціалізуємо налаштування за замовчуванням
    await initializeDefaults();
  },

  // Отримати статистику бази даних
  async getDatabaseStats(): Promise<{
    totalSessions: number;
    totalPushUps: number;
    oldestSession?: Date;
    newestSession?: Date;
    databaseSize: number;
  }> {
    const sessions = await this.getAllSessions();
    const totalSessions = sessions.length;
    const totalPushUps = sessions.reduce((sum, session) => sum + session.pushUps, 0);

    let oldestSession: Date | undefined;
    let newestSession: Date | undefined;

    if (sessions.length > 0) {
      oldestSession = sessions[sessions.length - 1].date;
      newestSession = sessions[0].date;
    }

    // Приблизна оцінка розміру бази даних
    const estimatedSize = sessions.length * 200; // bytes per session estimate

    return {
      totalSessions,
      totalPushUps,
      oldestSession,
      newestSession,
      databaseSize: estimatedSize,
    };
  },

  // Імпорт даних з JSON файлу
  async importData(importData: ImportData): Promise<ImportResult> {
    try {
      const result: ImportResult = {
        success: true,
        imported: 0,
        duplicates: 0,
        errors: [],
      };

      // Перевіримо формат даних
      if (!importData.sessions || !Array.isArray(importData.sessions)) {
        throw new Error('Некоректний формат файлу: відсутні дані про тренування');
      }

      // Отримаємо існуючі сесії для перевірки дублікатів
      const existingSessions = await this.getAllSessions();
      const existingSessionsMap = new Map(
        existingSessions.map((session) => [
          `${session.date.getTime()}-${session.pushUps}-${session.duration}`,
          session,
        ])
      );

      // Імпортуємо сесії
      for (const sessionData of importData.sessions) {
        try {
          // Конвертуємо дату з рядка в Date об'єкт
          const date = new Date(sessionData.date);
          if (isNaN(date.getTime())) {
            result.errors.push(`Невірна дата для сесії: ${sessionData.date}`);
            continue;
          }

          // Створюємо ключ для перевірки дублікатів
          const sessionKey = `${date.getTime()}-${sessionData.pushUps}-${sessionData.duration}`;

          if (existingSessionsMap.has(sessionKey)) {
            result.duplicates++;
            continue;
          }

          // Створюємо сесію для збереження
          const session: WorkoutSession = {
            id: crypto.randomUUID(),
            date,
            pushUps: sessionData.pushUps || 0,
            duration: sessionData.duration || 0,
            sets: sessionData.sets
              ? sessionData.sets.map((set) => ({
                  ...set,
                  timestamp: new Date(set.timestamp),
                }))
              : undefined,
            goal: sessionData.goal,
          };

          await db.workoutSessions.add(session);
          result.imported++;
        } catch (error) {
          result.errors.push(`Помилка при імпорті сесії: ${error}`);
        }
      }

      // Імпортуємо налаштування, якщо вони є
      if (importData.settings) {
        try {
          const currentSettings = await this.getSettings();
          const newSettings = { ...currentSettings, ...importData.settings };
          await this.updateSettings(newSettings);
        } catch (error) {
          result.errors.push(`Помилка при імпорті налаштувань: ${error}`);
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        duplicates: 0,
        errors: [`Критична помилка при імпорті: ${error}`],
      };
    }
  },

  // Валідація імпортованих даних
  validateImportData(data: ImportData): data is ImportData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.sessions || !Array.isArray(data.sessions)) {
      return false;
    }

    // Перевіримо кілька перших сесій
    for (let i = 0; i < Math.min(data.sessions.length, 5); i++) {
      const session = data.sessions[i];
      if (!session.date || !session.pushUps || typeof session.pushUps !== 'number') {
        return false;
      }
    }

    return true;
  },
};

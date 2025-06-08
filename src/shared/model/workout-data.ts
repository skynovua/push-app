import { useState, useEffect, useMemo } from 'react';
import { dbUtils } from '../lib/database';
import type { DailyStats, ImportData, ImportResult, PeriodStats, TimePeriod, WorkoutSession } from '@/shared/domain';

export const useWorkoutData = () => {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const allSessions = await dbUtils.getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadSessions();
  };

  // Функції видалення
  const deleteSession = async (sessionId: string) => {
    try {
      await dbUtils.deleteWorkoutSession(sessionId);
      await refreshData();
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  };

  const deleteMultipleSessions = async (sessionIds: string[]) => {
    try {
      await dbUtils.deleteMultipleSessions(sessionIds);
      await refreshData();
      return true;
    } catch (error) {
      console.error('Error deleting multiple sessions:', error);
      return false;
    }
  };

  const deleteSessionsByDate = async (date: Date) => {
    try {
      await dbUtils.deleteSessionsByDate(date);
      await refreshData();
      return true;
    } catch (error) {
      console.error('Error deleting sessions by date:', error);
      return false;
    }
  };

  const clearAllData = async () => {
    try {
      await dbUtils.clearAllData();
      // Примусово очищаємо стан сесій
      setSessions([]);
      setLoading(false);
      // Потім оновлюємо дані
      await refreshData();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  };

  // Группировка сессий по дням
  const dailyStats = useMemo(() => {
    const statsMap = new Map<string, DailyStats>();
    
    sessions.forEach(session => {
      const dateKey = session.date.toISOString().split('T')[0];
      const existing = statsMap.get(dateKey);
      
      if (existing) {
        existing.count += session.pushUps;
        existing.sessions += 1;
        existing.duration += session.duration;
      } else {
        statsMap.set(dateKey, {
          date: dateKey,
          count: session.pushUps,
          sessions: 1,
          duration: session.duration
        });
      }
    });    
    
    return Array.from(statsMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Последние 7 дней
  }, [sessions]);

  // Статистика за неделю
  const weeklyStats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return sessions
      .filter(session => session.date >= weekAgo)
      .reduce((total, session) => total + session.pushUps, 0);
  }, [sessions]);

  // Общее количество отжиманий
  const totalPushUps = useMemo(() => {
    return sessions.reduce((total, session) => total + session.pushUps, 0);
  }, [sessions]);

  // Сегодняшние отжимания
  const todayPushUps = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sessions
      .filter(session => session.date.toISOString().split('T')[0] === today)
      .reduce((total, session) => total + session.pushUps, 0);
  }, [sessions]);

  // Текущий стрик (дни подряд с тренировками)
  const currentStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    
    const sortedDates = Array.from(new Set(
      sessions.map(s => s.date.toISOString().split('T')[0])
    )).sort().reverse();
    
    let streak = 0;
    const currentDate = new Date();
    
    for (const date of sortedDates) {
      const checkDate = currentDate.toISOString().split('T')[0];
      if (date === checkDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, [sessions]);

  // Лучший день (максимум отжиманий за день)
  const bestDay = useMemo(() => {
    if (dailyStats.length === 0) return null;
    
    const maxDay = dailyStats.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return {
      count: maxDay.count,
      date: new Date(maxDay.date).toLocaleDateString()
    };
  }, [dailyStats]);

  // Средние отжимания за тренировку
  const averagePerSession = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(totalPushUps / sessions.length);
  }, [totalPushUps, sessions.length]);

  // Функція імпорту даних
  const importData = async (file: File): Promise<ImportResult> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ImportData;
      
      // Валідуємо дані
      if (!dbUtils.validateImportData(data)) {
        return {
          success: false,
          imported: 0,
          duplicates: 0,
          errors: ['Некоректний формат файлу']
        };
      }

      // Імпортуємо дані
      const result = await dbUtils.importData(data);
      
      // Оновлюємо дані після імпорту
      if (result.success && result.imported > 0) {
        await loadSessions();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        imported: 0,
        duplicates: 0,
        errors: [`Помилка при читанні файлу: ${error}`]
      };
    }
  };

  // Функції для різних періодів статистики
  const getStatsForPeriod = (period: TimePeriod): PeriodStats[] => {
    let data: PeriodStats[] = [];

    switch (period) {
      case 'week':
        // За останній тиждень (7 днів)
        data = getWeekStats();
        break;
      case 'month':
        // За останній місяць (30 днів)
        data = getMonthStats();
        break;
      case 'year':
        // За останній рік (365 днів або по місяцях)
        data = getYearStats();
        break;
      case 'allTime':
        // За весь час (по роках)
        data = getAllTimeStats();
        break;
    }

    return data;
  };

  // Функції для статистики за різні періоди
  const getWeekStats = (): PeriodStats[] => {
    const weekData: PeriodStats[] = [];
    const now = new Date();

    // Останні 7 днів
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];

      const dayStats = sessions
        .filter(session => {
          const sessionDate = session.date.toISOString().split('T')[0];
          return sessionDate === dateKey;
        })
        .reduce(
          (acc, session) => ({
            count: acc.count + session.pushUps,
            sessions: acc.sessions + 1,
            duration: acc.duration + session.duration
          }),
          { count: 0, sessions: 0, duration: 0 }
        );

      weekData.push({
        date: dateKey,
        count: dayStats.count,
        sessions: dayStats.sessions,
        duration: dayStats.duration,
        label: date.toLocaleDateString('uk-UA', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }

    return weekData;
  };

  const getMonthStats = (): PeriodStats[] => {
    const monthData: PeriodStats[] = [];
    const now = new Date();

    // Останні 4 тижні
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStats = sessions
        .filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= weekStart && sessionDate <= weekEnd;
        })
        .reduce(
          (acc, session) => ({
            count: acc.count + session.pushUps,
            sessions: acc.sessions + 1,
            duration: acc.duration + session.duration
          }),
          { count: 0, sessions: 0, duration: 0 }
        );

      monthData.push({
        date: weekStart.toISOString().split('T')[0],
        count: weekStats.count,
        sessions: weekStats.sessions,
        duration: weekStats.duration,
        label: `${weekStart.toLocaleDateString('uk-UA', { month: 'short' })} ${weekEnd.toLocaleDateString('uk-UA', { day: 'numeric' })}`
      });
    }

    return monthData;
  };

  const getYearStats = (): PeriodStats[] => {
    const yearData: PeriodStats[] = [];
    const now = new Date();

    // Останні 12 місяців
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);

      const monthStats = sessions
        .filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate.getFullYear() === monthDate.getFullYear() &&
                 sessionDate.getMonth() === monthDate.getMonth();
        })
        .reduce(
          (acc, session) => ({
            count: acc.count + session.pushUps,
            sessions: acc.sessions + 1,
            duration: acc.duration + session.duration
          }),
          { count: 0, sessions: 0, duration: 0 }
        );

      yearData.push({
        date: monthDate.toISOString().split('T')[0],
        count: monthStats.count,
        sessions: monthStats.sessions,
        duration: monthStats.duration,
        label: monthDate.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' })
      });
    }

    return yearData;
  };

  const getAllTimeStats = (): PeriodStats[] => {
    const allTimeData = new Map<number, { count: number; sessions: number; duration: number }>();

    // Групуємо всі дані по роках
    sessions.forEach(session => {
      const year = new Date(session.date).getFullYear();
      const existing = allTimeData.get(year);

      if (existing) {
        existing.count += session.pushUps;
        existing.sessions += 1;
        existing.duration += session.duration;
      } else {
        allTimeData.set(year, {
          count: session.pushUps,
          sessions: 1,
          duration: session.duration
        });
      }
    });

    return Array.from(allTimeData.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, stats]) => ({
        date: `${year}-01-01`,
        count: stats.count,
        sessions: stats.sessions,
        duration: stats.duration,
        label: year.toString()
      }));
  };

  return {
    sessions,
    dailyStats,
    loading,
    refreshData,
    // Функції видалення
    deleteSession,
    deleteMultipleSessions,
    deleteSessionsByDate,
    clearAllData,
    // Функція імпорту
    importData,
    // Статистика
    totalPushUps,
    todayPushUps,
    weeklyStats,
    currentStreak,
    bestDay,
    averagePerSession,
    totalSessions: sessions.length,
    // Нові функції для періодів
    getStatsForPeriod
  };
};
import { useState, useEffect, useMemo } from 'react';
import type { WorkoutSession, DailyStats } from '../types';
import { dbUtils } from '../services/database';

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
    if (dailyStats.length === 0) return 0;
    return Math.max(...dailyStats.map(day => day.count));
  }, [dailyStats]);

  // Средние отжимания за тренировку
  const averagePerSession = useMemo(() => {
    if (sessions.length === 0) return 0;
    return Math.round(totalPushUps / sessions.length);
  }, [totalPushUps, sessions.length]);

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
    // Статистика
    totalPushUps,
    todayPushUps,
    weeklyStats,
    currentStreak,
    bestDay,
    averagePerSession,
    totalSessions: sessions.length
  };
};
import React, { useState } from 'react';
import { Calendar, Clock, Flame, Target, Trash2, Trophy } from 'lucide-react';

import type { WorkoutSession } from '@/shared/domain';
import { showToast, useTranslation } from '@/shared/lib';
import { useWorkoutData } from '@/shared/model/workout-data';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog';

export const WorkoutHistory: React.FC = () => {
  const { sessions, deleteSession } = useWorkoutData();
  const { t, locale } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      const success = await deleteSession(sessionId);
      if (success) {
        showToast.success(t('stats.sessionDeleted'), t('stats.sessionDeletedSuccess'));
      } else {
        showToast.error(t('stats.errorDeleting'), t('stats.errorDeletingSession'));
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast.error(t('stats.errorDeleting'), t('stats.errorDeletingGeneral'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (date: Date) => {
    const localeCode = locale === 'ua' ? 'uk-UA' : 'en-US';
    return new Intl.DateTimeFormat(localeCode, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Format date and time separately for mobile
  const formatDate = (date: Date) => {
    const localeCode = locale === 'ua' ? 'uk-UA' : 'en-US';
    return new Intl.DateTimeFormat(localeCode, {
      day: '2-digit',
      month: 'short',
    }).format(date);
  };

  const formatTime = (date: Date) => {
    const localeCode = locale === 'ua' ? 'uk-UA' : 'en-US';
    return new Intl.DateTimeFormat(localeCode, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Показуємо останні 10 тренувань
  const recentSessions = sessions.slice(0, 10);

  if (recentSessions.length === 0) {
    return (
      <div className="text-muted-foreground px-4 py-8 text-center">
        <Calendar className="mx-auto mb-2 h-8 w-8" />
        <p className="text-sm sm:text-base">{t('stats.noDataYet')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSessions.map((session: WorkoutSession) => (
        <Card key={session.id} className="border-border/50 border">
          <CardContent className="p-3 sm:p-4">
            {/* Mobile Layout: Stack elements vertically */}
            <div className="flex flex-col gap-y-3 sm:flex-row sm:items-center sm:justify-between sm:gap-y-0">
              {/* Main content area */}
              <div className="flex items-center justify-between sm:flex-1">
                {/* Кількість віджимань */}
                <div className="text-center">
                  <div className="text-primary text-xl font-bold sm:text-2xl">
                    {session.pushUps}
                  </div>
                  <div className="text-muted-foreground text-xs">{t('stats.pushUps')}</div>
                </div>

                {/* Інформація про сесію */}
                <div className="mx-3 flex flex-1 flex-col gap-1 sm:mx-4">
                  {/* Mobile: Show date and time on separate lines */}
                  <div className="flex flex-col gap-1 sm:hidden">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                      <span>
                        {formatTime(session.date)} • {formatDuration(session.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop: Show date and time together */}
                  <div className="hidden space-y-1 sm:block">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{formatDateTime(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="text-muted-foreground h-4 w-4 flex-shrink-0" />
                      <span>{formatDuration(session.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Кнопка видалення - на мобільному справа */}
                <div className="sm:hidden">
                  <DeleteConfirmDialog
                    title={t('stats.deleteSession')}
                    description={t('stats.confirmDelete')}
                    onConfirm={() => handleDeleteSession(session.id)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === session.id}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </DeleteConfirmDialog>
                </div>
              </div>

              {/* Бейджі - на мобільному внизу, на десктопі справа */}
              <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:gap-2 [&:empty]:hidden">
                {session.goal && session.pushUps >= session.goal && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    <Target className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{t('stats.goalAchieved')}</span>
                    <span className="sm:hidden">{t('stats.goal')}</span>
                  </Badge>
                )}
                {session.pushUps >= 50 && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                  >
                    <Trophy className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{t('stats.excellent')}</span>
                    <span className="sm:hidden">{t('stats.fiftyPlus')}</span>
                  </Badge>
                )}
                {session.pushUps >= 100 && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                  >
                    <Flame className="mr-1 h-3 w-3" />
                    <span className="hidden sm:inline">{t('stats.top')}</span>
                    <span className="sm:hidden">{t('stats.hundredPlus')}</span>
                  </Badge>
                )}
              </div>

              {/* Кнопка видалення - на десктопі справа */}
              <div className="hidden sm:ml-4 sm:block">
                <DeleteConfirmDialog
                  title={t('stats.deleteSession')}
                  description={t('stats.confirmDelete')}
                  onConfirm={() => handleDeleteSession(session.id)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === session.id}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DeleteConfirmDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {sessions.length > 10 && (
        <div className="px-4 pt-4 text-center">
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('stats.showingRecentWorkouts')} {sessions.length}
          </p>
        </div>
      )}
    </div>
  );
};

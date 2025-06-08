import React, { useState } from 'react';
import { Trash2, Clock, Calendar, Target, Trophy, Flame } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { useWorkoutData } from '@/shared/model/workout-data';
import { useT, useTranslation, showToast } from '@/shared/lib';
import { DeleteConfirmDialog } from '@/shared/ui/delete-confirm-dialog';
import type { WorkoutSession } from '@/shared/domain';

export const WorkoutHistory: React.FC = () => {
  const { sessions, deleteSession } = useWorkoutData();
  const t = useT();
  const { locale } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      const success = await deleteSession(sessionId);
      if (success) {
        showToast.success(
          t.stats.sessionDeleted,
          t.stats.sessionDeletedSuccess
        );
      } else {
        showToast.error(
          t.stats.errorDeleting,
          t.stats.errorDeletingSession
        );
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      showToast.error(
        t.stats.errorDeleting,
        t.stats.errorDeletingGeneral
      );
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
      minute: '2-digit'
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
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mx-auto mb-2" />
        <p>{t.stats.noDataYet}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSessions.map((session: WorkoutSession) => (
        <Card key={session.id} className="border border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Кількість віджимань */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {session.pushUps}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.stats.pushUps}
                  </div>
                </div>

                {/* Інформація про сесію */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateTime(session.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(session.duration)}</span>
                  </div>
                </div>

                {/* Бейджі */}
                <div className="space-x-2">
                  {session.goal && session.pushUps >= session.goal && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      <Target className="h-3 w-3 mr-1" />
                      Ціль досягнута
                    </Badge>
                  )}
                  {session.pushUps >= 50 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      <Trophy className="h-3 w-3 mr-1" />
                      Відмінно
                    </Badge>
                  )}
                  {session.pushUps >= 100 && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      <Flame className="h-3 w-3 mr-1" />
                      Топ
                    </Badge>
                  )}
                </div>
              </div>

              {/* Кнопка видалення */}
              <DeleteConfirmDialog
                title={t.stats.deleteSession}
                description={t.stats.confirmDelete}
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
          </CardContent>
        </Card>
      ))}

      {sessions.length > 10 && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Показано останні 10 тренувань з {sessions.length}
          </p>
        </div>
      )}
    </div>
  );
};

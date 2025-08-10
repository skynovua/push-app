import React from 'react';
import { Award, Calendar, Flame, Star, Target, TrendingUp } from 'lucide-react';

import { useTranslation } from '@/shared/lib';
import { useWorkoutData } from '@/shared/model';
import { Badge } from '@/shared/ui/badge';
// Shared imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

import { StatsChart } from './stats-chart';
// Feature-specific components
import { WorkoutHistory } from './workout-history';

export const StatsFeature: React.FC = () => {
  const {
    totalPushUps,
    todayPushUps,
    weeklyStats,
    currentStreak,
    bestDay,
    averagePerSession,
    totalSessions,
    loading,
  } = useWorkoutData();

  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">{t('stats.loading')}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">{t('stats.title')}</h2>
        <p className="text-muted-foreground">{t('stats.subtitle')}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              {t('common.today')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPushUps}</div>
            <p className="text-muted-foreground mt-1 text-xs">{t('stats.pushUps')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {t('stats.currentStreak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="mt-1 flex items-center gap-1">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                {currentStreak > 0 ? (
                  <>
                    <Flame className="h-3 w-3" />
                    {t('stats.onFire')}
                  </>
                ) : (
                  <>
                    <Star className="h-3 w-3" />
                    {t('stats.startToday')}
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              {t('stats.total')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPushUps}</div>
            <p className="text-muted-foreground mt-1 text-xs">{t('stats.allTime')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" />
              {t('stats.bestDay')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDay?.count || 0}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {bestDay?.date || t('stats.noData')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.weeklyOverview')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t('stats.forWeek')}:</span>
              <span className="font-medium">
                {weeklyStats} {t('stats.pushUps')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t('stats.totalSessions')}:</span>
              <span className="font-medium">{totalSessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stats.averages')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t('stats.perSession')}:</span>
              <span className="font-medium">{averagePerSession}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t('stats.streak')}:</span>
              <span className="font-medium">
                {currentStreak} {t('stats.days')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      {totalSessions > 0 && <StatsChart />}

      {/* Workout History */}
      {totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('stats.workoutHistory')}
            </CardTitle>
            <CardDescription>{t('stats.recentWorkouts')}</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkoutHistory />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

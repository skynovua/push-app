import React from 'react';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';

// Shared imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useWorkoutData } from '@/shared/model';
import { useT } from '@/shared/lib';

// Feature-specific components
import { WorkoutHistory } from './workout-history';
import { StatsChart } from './stats-chart';

export const StatsFeature: React.FC = () => {
  const {
    totalPushUps,
    todayPushUps,
    weeklyStats,
    currentStreak,
    bestDay,
    averagePerSession,
    totalSessions,
    loading
  } = useWorkoutData();

  const t = useT();

  if (loading) {
    return (
      <div className="py-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t.stats.loading}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t.stats.title}</h2>
        <p className="text-muted-foreground">{t.stats.subtitle}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t.common.today}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPushUps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.stats.pushUps}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t.stats.currentStreak}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {currentStreak > 0 ? t.stats.onFire : t.stats.startToday}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              {t.stats.total}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPushUps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t.stats.allTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t.stats.bestDay}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDay?.count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {bestDay?.date || t.stats.noData}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.stats.weeklyOverview}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t.stats.forWeek}:</span>
              <span className="font-medium">{weeklyStats} {t.stats.pushUps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t.stats.totalSessions}:</span>
              <span className="font-medium">{totalSessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.stats.averages}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t.stats.perSession}:</span>
              <span className="font-medium">{averagePerSession}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t.stats.streak}:</span>
              <span className="font-medium">{currentStreak} {t.stats.days}</span>
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
              {t.stats.workoutHistory}
            </CardTitle>
            <CardDescription>
              {t.stats.recentWorkouts}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkoutHistory />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

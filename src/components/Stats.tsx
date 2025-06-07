import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { useWorkoutData } from '../hooks/useWorkoutData';

export const Stats: React.FC = () => {
  const {
    dailyStats,
    totalPushUps,
    todayPushUps,
    weeklyStats,
    currentStreak,
    bestDay,
    averagePerSession,
    totalSessions,
    loading
  } = useWorkoutData();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Загрузка статистики...</h2>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Статистика</h2>
        <p className="text-muted-foreground">Ваш прогресс и достижения</p>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Всего отжиманий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPushUps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              За {totalSessions} тренировок
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Сегодня
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPushUps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              отжиманий
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Текущий стрик
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                🔥 {currentStreak > 0 ? 'В огне!' : 'Начни сегодня!'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Лучший день
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDay}</div>
            <p className="text-xs text-muted-foreground mt-1">
              отжиманий
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Дополнительная статистика</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Среднее за тренировку:</span>
              <span className="font-medium">{averagePerSession} отжиманий</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">За неделю:</span>
              <span className="font-medium">{weeklyStats} отжиманий</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Всего тренировок:</span>
              <span className="font-medium">{totalSessions}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      {dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Прогресс за последние дни</CardTitle>
            <CardDescription>
              Количество отжиманий по дням
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(label) => formatDate(label as string)}
                  formatter={(value: number) => [value, 'Отжимания']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sessions Chart */}
      {dailyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Тренировки по дням</CardTitle>
            <CardDescription>
              Количество тренировок за день
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  className="text-xs"
                />
                <YAxis className="text-xs" />
                <Tooltip 
                  labelFormatter={(label) => formatDate(label as string)}
                  formatter={(value: number) => [value, 'Тренировки']}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalSessions === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет данных</h3>
            <p className="text-muted-foreground mb-4">
              Начните свою первую тренировку, чтобы увидеть статистику
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

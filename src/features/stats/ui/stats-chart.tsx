import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';

// Shared imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { useWorkoutData } from '@/shared/model';
import { useT } from '@/shared/lib';
import type { TimePeriod, PeriodStats } from '@/shared/domain';

export const StatsChart: React.FC = () => {
  const { getStatsForPeriod, sessions } = useWorkoutData();
  const t = useT();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');

  const currentStats = getStatsForPeriod(selectedPeriod);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'count') {
      return [`${value} ${t.stats.pushUps}`, t.stats.totalPushUps];
    }
    if (name === 'sessions') {
      return [`${value} ${t.stats.sessionsCount}`, t.stats.sessionsCount];
    }
    return [value, name];
  };

  const getTotalForPeriod = (stats: PeriodStats[]) => {
    return stats.reduce((total, stat) => total + stat.count, 0);
  };

  const getAverageForPeriod = (stats: PeriodStats[], period: TimePeriod) => {
    const total = getTotalForPeriod(stats);
    if (total === 0) return 0;
    
    let totalDays = 0;
    
    switch (period) {
      case 'week': {
        totalDays = 7; // 7 днів
        break;
      }
      case 'month': {
        totalDays = 30; // 30 днів
        break;
      }
      case 'year': {
        totalDays = 365; // 365 днів
        break;
      }
      case 'allTime': {
        // Для весь час знаходимо першу сесію
        if (sessions.length === 0) return 0;
        const sortedSessions = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());
        const firstDate = sortedSessions[0].date;
        const daysDiff = Math.ceil(
          (new Date().getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        totalDays = Math.max(1, daysDiff);
        break;
      }
    }
    
    return totalDays > 0 ? Math.round(total / totalDays) : 0;
  };

  const getBestDayForPeriod = (period: TimePeriod) => {
    if (sessions.length === 0) return { count: 0, label: '' };
    
    let filteredSessions = sessions;
    const now = new Date();
    
    // Фільтруємо сесії за обраний період
    switch (period) {
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredSessions = sessions.filter(session => session.date >= weekAgo);
        break;
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filteredSessions = sessions.filter(session => session.date >= monthAgo);
        break;
      }
      case 'year': {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredSessions = sessions.filter(session => session.date >= yearAgo);
        break;
      }
      case 'allTime': {
        // Для весь час використовуємо всі сесії
        filteredSessions = sessions;
        break;
      }
    }
    
    if (filteredSessions.length === 0) return { count: 0, label: '' };
    
    // Групуємо сесії по дням і знаходимо найкращий день
    const dailyTotals = new Map<string, number>();
    
    filteredSessions.forEach(session => {
      const dateKey = session.date.toISOString().split('T')[0];
      const existing = dailyTotals.get(dateKey) || 0;
      dailyTotals.set(dateKey, existing + session.pushUps);
    });
    
    // Знаходимо день з максимальною кількістю віджимань
    let bestDay = { count: 0, date: '' };
    for (const [date, count] of dailyTotals.entries()) {
      if (count > bestDay.count) {
        bestDay = { count, date };
      }
    }
    
    if (bestDay.count === 0) return { count: 0, label: '' };
    
    return {
      count: bestDay.count,
      label: new Date(bestDay.date).toLocaleDateString('uk-UA', { 
        month: 'short', 
        day: 'numeric' 
      })
    };
  };

  const renderChart = (data: PeriodStats[], period: TimePeriod) => {
    // Для allTime використовуємо BarChart
    if (period === 'allTime') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="label"
              className="text-muted-foreground"
              fontSize={12}
            />
            <YAxis className="text-muted-foreground" fontSize={12} />
            <Tooltip 
              formatter={formatTooltipValue}
              labelClassName="text-foreground"
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Для інших періодів використовуємо LineChart
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="label"
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis className="text-muted-foreground" fontSize={12} />
          <Tooltip 
            formatter={formatTooltipValue}
            labelClassName="text-foreground"
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '6px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="var(--primary)" 
            strokeWidth={3}
            dot={{ fill: "var(--primary)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderStatsCards = (stats: PeriodStats[]) => {
    const total = getTotalForPeriod(stats);
    const average = getAverageForPeriod(stats, selectedPeriod);
    const bestDay = getBestDayForPeriod(selectedPeriod);
    const totalSessions = stats.reduce((sum, stat) => sum + stat.sessions, 0);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {t.stats.totalPushUps}
                </p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {selectedPeriod === 'allTime' ? 'Середньо за день' : t.stats.averagePerDay}
                </p>
                <p className="text-2xl font-bold">{average}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {t.stats.totalSessions}
                </p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-orange-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Найкращий день
                </p>
                <p className="text-2xl font-bold">{bestDay.count}</p>
                {bestDay.count > 0 && (
                  <p className="text-xs text-muted-foreground">{bestDay.label}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t.stats.title}</h2>
        <p className="text-muted-foreground">{t.stats.yourProgress}</p>
      </div>

      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="week" className="text-xs sm:text-sm">
            {t.stats.timePeriods.week}
          </TabsTrigger>
          <TabsTrigger value="month" className="text-xs sm:text-sm">
            {t.stats.timePeriods.month}
          </TabsTrigger>
          <TabsTrigger value="year" className="text-xs sm:text-sm">
            {t.stats.timePeriods.year}
          </TabsTrigger>
          <TabsTrigger value="allTime" className="text-xs sm:text-sm">
            {t.stats.timePeriods.allTime}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.week}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.week}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'week')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.month}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.month}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'month')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.year}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'year')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allTime" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.stats.chartTitles.allTime}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.allTime}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'allTime')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, BarChart3, Activity } from 'lucide-react';

// Shared imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/shared/ui/chart';
import { useWorkoutData } from '@/shared/model';
import { useT, createPushUpChartConfig, formatPushUpTooltip } from '@/shared/lib';
import type { TimePeriod, PeriodStats } from '@/shared/domain';

export const StatsChart: React.FC = () => {
  const { getStatsForPeriod, sessions } = useWorkoutData();
  const t = useT();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');

  const currentStats = getStatsForPeriod(selectedPeriod);

  console.log('currentStats:', currentStats);
  

  // Chart configuration for shadcn/ui charts
  const chartConfig = createPushUpChartConfig({
    totalPushUps: t.stats.totalPushUps,
    sessionsCount: t.stats.sessionsCount,
    pushUps: t.stats.pushUps,
  });  

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
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--muted-foreground)"
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="label"
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis 
              fontSize={12}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => formatPushUpTooltip(
                  value as number, 
                  name as string, 
                  {
                    sessionsCount: t.stats.sessionsCount,
                    pushUps: t.stats.pushUps,
                  }
                )}
              />} 
            />
            <Bar 
              dataKey="count" 
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            />
          </BarChart>
        </ChartContainer>
      );
    }

    // Для інших періодів використовуємо LineChart
    return (
      <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
        <LineChart data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--muted-foreground)"
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="label"
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)" }}
          />
          <YAxis 
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)" }}
          />
          <ChartTooltip 
            content={<ChartTooltipContent 
              formatter={(value, name) => formatPushUpTooltip(
                value as number, 
                name as string, 
                {
                  sessionsCount: t.stats.sessionsCount,
                  pushUps: t.stats.pushUps,
                }
              )}
            />} 
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="var(--primary)" 
            strokeWidth={2}
            dot={{ fill: "var(--primary)" }}
            activeDot={{ r: 6, stroke: "var(--primary)" }}
            animationDuration={800}
            animationBegin={0}
          />
        </LineChart>
      </ChartContainer>
    );
  };

  const renderStatsCards = (stats: PeriodStats[]) => {
    const total = getTotalForPeriod(stats);
    const average = getAverageForPeriod(stats, selectedPeriod);
    const bestDay = getBestDayForPeriod(selectedPeriod);
    const totalSessions = stats.reduce((sum, stat) => sum + stat.sessions, 0);

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.stats.totalPushUps}
                </p>
                <p className="text-2xl font-bold tracking-tight">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {selectedPeriod === 'allTime' ? 'Середньо за день' : t.stats.averagePerDay}
                </p>
                <p className="text-2xl font-bold tracking-tight">{average}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t.stats.totalSessions}
                </p>
                <p className="text-2xl font-bold tracking-tight">{totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <BarChart3 className="h-5 w-5 text-orange-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Найкращий день
                </p>
                <p className="text-2xl font-bold tracking-tight">{bestDay.count}</p>
                {bestDay.count > 0 && (
                  <p className="text-xs text-muted-foreground font-medium">{bestDay.label}</p>
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
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                {t.stats.chartTitles.week}
              </CardTitle>
              <CardDescription className="text-sm">
                {t.stats.periodLabels.week}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {renderChart(currentStats, 'week')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                {t.stats.chartTitles.month}
              </CardTitle>
              <CardDescription className="text-sm">
                {t.stats.periodLabels.month}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {renderChart(currentStats, 'month')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                {t.stats.chartTitles.year}
              </CardTitle>
              <CardDescription className="text-sm">
                {t.stats.periodLabels.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {renderChart(currentStats, 'year')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allTime" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500/5 via-transparent to-transparent">
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-500/10">
                  <BarChart3 className="h-4 w-4 text-orange-500" />
                </div>
                {t.stats.chartTitles.allTime}
              </CardTitle>
              <CardDescription className="text-sm">
                {t.stats.periodLabels.allTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {renderChart(currentStats, 'allTime')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

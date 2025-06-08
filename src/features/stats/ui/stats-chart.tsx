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
  const { getStatsForPeriod } = useWorkoutData();
  const t = useT();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('daily');

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

  const getAverageForPeriod = (stats: PeriodStats[]) => {
    const total = getTotalForPeriod(stats);
    const nonZeroDays = stats.filter(stat => stat.count > 0).length;
    return nonZeroDays > 0 ? Math.round(total / nonZeroDays) : 0;
  };

  const getBestDayForPeriod = (stats: PeriodStats[]) => {
    return stats.reduce((max, stat) => stat.count > max.count ? stat : max, stats[0] || { count: 0, label: '' });
  };

  const renderChart = (data: PeriodStats[], period: TimePeriod) => {
    // Для щорічної статистики використовуємо BarChart
    if (period === 'yearly') {
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
    const average = getAverageForPeriod(stats);
    const bestDay = getBestDayForPeriod(stats);
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
                  {t.stats.averagePerDay}
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
                <p className="text-xs text-muted-foreground">{bestDay.label}</p>
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
          <TabsTrigger value="daily" className="text-xs sm:text-sm">
            {t.stats.timePeriods.daily}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs sm:text-sm">
            {t.stats.timePeriods.weekly}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs sm:text-sm">
            {t.stats.timePeriods.monthly}
          </TabsTrigger>
          <TabsTrigger value="yearly" className="text-xs sm:text-sm">
            {t.stats.timePeriods.yearly}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.daily}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.lastWeek}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'daily')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.weekly}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.last12Weeks}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'weekly')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t.stats.chartTitles.monthly}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.last12Months}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'monthly')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          {renderStatsCards(currentStats)}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t.stats.chartTitles.yearly}
              </CardTitle>
              <CardDescription>
                {t.stats.periodLabels.years}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentStats, 'yearly')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

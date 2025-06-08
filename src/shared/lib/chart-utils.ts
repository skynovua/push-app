// Chart utilities for consistent theming and styling
import type { ChartConfig } from '@/shared/ui/chart';

/**
 * Create chart configuration for push-up stats
 */
export const createPushUpChartConfig = (labels: {
  totalPushUps: string;
  sessionsCount: string;
  pushUps: string;
}): ChartConfig => ({
  count: {
    label: labels.totalPushUps,
    color: 'var(--chart-1)',
  },
  sessions: {
    label: labels.sessionsCount,
    color: 'var(--chart-2)',
  },
});

/**
 * Custom formatter for push-up chart tooltips
 */
export const formatPushUpTooltip = (
  value: number,
  name: string,
  labels: {
    totalPushUps: string;
    sessionsCount: string;
    pushUps: string;
  }
): [string, string] => {
  if (name === 'count') {
    return [`${value} ${labels.pushUps}`, labels.totalPushUps];
  }
  if (name === 'sessions') {
    return [`${value}`, labels.sessionsCount];
  }
  return [value.toString(), name];
};

/**
 * Chart theme colors for different data types
 */
export const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  accent: 'hsl(var(--chart-3))',
  success: 'hsl(var(--chart-4))',
  warning: 'hsl(var(--chart-5))',
} as const;

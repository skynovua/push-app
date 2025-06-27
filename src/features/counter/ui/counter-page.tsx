import React, { useEffect, useRef } from 'react';
import { Pause, Play, RotateCcw, Save, Trophy } from 'lucide-react';

import { showToast } from '@/shared/lib/toast';
import { useT } from '@/shared/lib/translation';
// Shared Model & Utils
import { useWorkoutStore } from '@/shared/model/workout-store';
import { Badge } from '@/shared/ui/badge';
// Shared UI
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';

export const CounterFeature: React.FC = () => {
  const {
    currentCount,
    isActive,
    elapsedTime,
    dailyGoal,
    todayPushUps,
    sessionStartTime,
    incrementCount,
    resetCount,
    startSession,
    pauseSession,
    endSession,
    setElapsedTime,
    loadTodayStats,
  } = useWorkoutStore();

  const t = useT();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load today's stats on component mount
  useEffect(() => {
    loadTodayStats();
  }, [loadTodayStats]);

  // Timer effect
  useEffect(() => {
    if (isActive && sessionStartTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, sessionStartTime, setElapsedTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    startSession();
    showToast.success(t.counter.sessionStarted);
  };

  const handlePause = () => {
    pauseSession();
    showToast.info(t.counter.sessionPaused);
  };

  const handleReset = () => {
    resetCount();
    showToast.info(t.counter.sessionReset);
  };

  const handleSave = async () => {
    await endSession();
    showToast.success(t.counter.sessionSaved);
    // Today's stats will be automatically updated by endSession -> loadTodayStats
  };

  const progressPercentage = Math.min(((todayPushUps + currentCount) / dailyGoal) * 100, 100);

  return (
    <div className="space-y-6 py-6">
      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t.counter.dailyProgress}</CardTitle>
            <Badge variant={todayPushUps + currentCount >= dailyGoal ? 'default' : 'secondary'}>
              {todayPushUps + currentCount}/{dailyGoal}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>0</span>
            <span>{Math.round(progressPercentage)}%</span>
            <span>{dailyGoal}</span>
          </div>
          {todayPushUps > 0 && (
            <div className="text-muted-foreground text-center text-xs">
              {t.counter.totalToday}: {todayPushUps} + {currentCount} ={' '}
              {todayPushUps + currentCount}
            </div>
          )}
          {todayPushUps === 0 && currentCount === 0 && (
            <div className="text-muted-foreground text-center text-xs">{t.counter.startPrompt}</div>
          )}
        </CardContent>
      </Card>

      {/* Main Counter */}
      <Card className="text-center">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">{t.counter.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="relative">
            <button
              onClick={incrementCount}
              disabled={!isActive}
              className="border-primary bg-primary/10 hover:bg-primary/20 group mx-auto flex h-48 w-48 items-center justify-center rounded-full border-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={t.counter.clickToIncrement}
            >
              <div className="text-center">
                <div className="text-primary inline-block min-w-[120px] font-mono text-6xl font-bold tabular-nums">
                  {currentCount}
                </div>
                <div className="text-muted-foreground mt-2 text-sm">{t.counter.pushUps}</div>
              </div>
            </button>
          </div>

          {/* Session Info */}
          {isActive || currentCount > 0 ? (
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-medium tabular-nums">{formatTime(elapsedTime)}</div>
                <div className="text-muted-foreground">{t.counter.time}</div>
              </div>
              <div className="text-center">
                <div className="font-mono font-medium tabular-nums">{currentCount}</div>
                <div className="text-muted-foreground">{t.counter.count}</div>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-center">
              <p>{t.counter.startPrompt}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isActive ? (
          <Button onClick={handleStart} size="lg" className="h-12 flex-1">
            <Play className="mr-2 h-5 w-5" />
            {t.common.start}
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" size="lg" className="h-12 flex-1">
            <Pause className="mr-2 h-5 w-5" />
            {t.common.pause}
          </Button>
        )}

        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="h-12 flex-1"
          disabled={currentCount === 0 && elapsedTime === 0}
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          {t.common.reset}
        </Button>
      </div>

      {/* Save Session Button */}
      {currentCount > 0 && (
        <Button onClick={handleSave} size="lg" className="h-12 w-full" variant="default">
          <Save className="mr-2 h-5 w-5" />
          {t.common.save} {t.counter.currentSession.toLowerCase()}
        </Button>
      )}

      {/* Hints */}
      <div className="space-y-2 text-center">
        <p className="text-muted-foreground text-sm">
          {!isActive ? t.counter.startHint : t.counter.tapHint}
        </p>
        {todayPushUps + currentCount >= dailyGoal && (
          <Badge className="mx-auto">
            <Trophy className="mr-1 h-4 w-4" />
            {t.counter.goalReached}
          </Badge>
        )}
      </div>
    </div>
  );
};

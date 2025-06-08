import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';

// Shared UI
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';

// Shared Model & Utils
import { useWorkoutStore } from '@/shared/model/workout-store';
import { useT } from '@/shared/lib/translation';
import { showToast } from '@/shared/lib/toast';

export const CounterFeature: React.FC = () => {
  const {
    currentCount,
    isActive,
    elapsedTime,
    dailyGoal,
    sessionStartTime,
    incrementCount,
    resetCount,
    startSession,
    pauseSession,
    endSession,
    setElapsedTime
  } = useWorkoutStore();

  const t = useT();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  const progressPercentage = Math.min((currentCount / dailyGoal) * 100, 100);

  return (
    <div className="py-6 space-y-6">
      {/* Goal Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{t.counter.dailyProgress}</CardTitle>
            <Badge variant={currentCount >= dailyGoal ? "default" : "secondary"}>
              {currentCount}/{dailyGoal}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span>{Math.round(progressPercentage)}%</span>
            <span>{dailyGoal}</span>
          </div>
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
              className="w-48 h-48 mx-auto rounded-full border-4 border-primary bg-primary/10 hover:bg-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              aria-label={t.counter.clickToIncrement}
            >
              <div className="text-center">
                <div className="text-6xl font-bold text-primary">
                  {currentCount}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {t.counter.pushUps}
                </div>
              </div>
            </button>
          </div>

          {/* Session Info */}
          {isActive || currentCount > 0 ? (
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-medium">{formatTime(elapsedTime)}</div>
                <div className="text-muted-foreground">{t.counter.time}</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{currentCount}</div>
                <div className="text-muted-foreground">{t.counter.count}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>{t.counter.startPrompt}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-3">
        {!isActive ? (
          <Button
            onClick={handleStart}
            size="lg"
            className="flex-1 h-12"
          >
            <Play className="h-5 w-5 mr-2" />
            {t.common.start}
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            size="lg"
            className="flex-1 h-12"
          >
            <Pause className="h-5 w-5 mr-2" />
            {t.common.pause}
          </Button>
        )}
        
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          className="flex-1 h-12"
          disabled={currentCount === 0 && elapsedTime === 0}
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          {t.common.reset}
        </Button>
      </div>

      {/* Save Session Button */}
      {currentCount > 0 && (
        <Button
          onClick={handleSave}
          size="lg"
          className="w-full h-12"
          variant="default"
        >
          <Save className="h-5 w-5 mr-2" />
          {t.common.save} {t.counter.currentSession.toLowerCase()}
        </Button>
      )}

      {/* Hints */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {!isActive ? t.counter.startHint : t.counter.tapHint}
        </p>
        {currentCount >= dailyGoal && (
          <Badge className="mx-auto">
            🎉 {t.counter.goalReached}
          </Badge>
        )}
      </div>
    </div>
  );
};

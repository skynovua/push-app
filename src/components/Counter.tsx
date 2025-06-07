import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWorkoutStore } from '../hooks/useWorkoutStore';
import { useT } from '../hooks/useTranslation';

export const Counter: React.FC = () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = Math.min((currentCount / dailyGoal) * 100, 100);

  const handleStart = () => {
    if (!isActive && currentCount === 0) {
      startSession();
    } else {
      startSession();
    }
  };

  const handlePause = () => {
    pauseSession();
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    resetCount();
  };

  const handleSave = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await endSession();
  };

  const getMotivationalMessage = () => {
    if (currentCount === 0) return t.counter.keepGoing;
    if (currentCount < dailyGoal * 0.25) return t.stats.greatProgress;
    if (currentCount < dailyGoal * 0.5) return t.stats.keepItUp;
    if (currentCount < dailyGoal * 0.75) return t.stats.onFire;
    if (currentCount < dailyGoal) return t.counter.almostThere;
    return t.counter.goalReached;
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-md mx-auto">
      {/* Progress Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{t.counter.progressToGoal}</span>
            <Badge variant={currentCount >= dailyGoal ? "default" : "secondary"}>
              {currentCount}/{dailyGoal}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {getMotivationalMessage()}
          </p>
        </CardContent>
      </Card>

      {/* Timer Display */}
      {(isActive || elapsedTime > 0) && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-primary">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t.counter.sessionTime}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Counter Button */}
      <div className="relative">
        <button
          onClick={incrementCount}
          disabled={!isActive}
          className={`
            w-48 h-48 rounded-full text-7xl font-bold shadow-2xl 
            transition-all duration-200 transform
            ${isActive 
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-95 hover:shadow-xl' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
            }
            ${currentCount > 0 ? 'animate-pulse' : ''}
          `}
          style={{
            animationDuration: isActive ? '2s' : 'none'
          }}
        >
          {currentCount}
        </button>
        
        {/* Goal achievement effect */}
        {currentCount >= dailyGoal && (
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping" />
        )}
      </div>

      {/* Achievement indicator */}
      {currentCount >= dailyGoal && (
        <div className="text-center">
          <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black">
            🏆 {t.counter.goalReached}
          </Badge>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 w-full">
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
        {!isActive && currentCount === 0 && (
          <p className="text-sm text-muted-foreground">
            {t.counter.startHint.replace('{start}', t.common.start)}
          </p>
        )}
        {isActive && (
          <p className="text-sm text-muted-foreground">
            {t.counter.clickHint}
          </p>
        )}
      </div>
    </div>
  );
};
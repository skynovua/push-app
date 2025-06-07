import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useWorkoutStore } from '../hooks/useWorkoutStore';

export const Counter: React.FC = () => {
  const {
    currentCount,
    isActive,
    elapsedTime,
    dailyGoal,
    incrementCount,
    resetCount,
    startSession,
    pauseSession,
    endSession,
    setElapsedTime
  } = useWorkoutStore();

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (isActive) {
      const id = setInterval(() => {
        setElapsedTime(elapsedTime + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, elapsedTime, intervalId, setElapsedTime]);

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
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    resetCount();
  };

  const handleSave = async () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    await endSession();
  };

  const getMotivationalMessage = () => {
    if (currentCount === 0) return "Готов к тренировке?";
    if (currentCount < dailyGoal * 0.25) return "Отличное начало! 💪";
    if (currentCount < dailyGoal * 0.5) return "Продолжай в том же духе! 🔥";
    if (currentCount < dailyGoal * 0.75) return "Больше половины пути! 🚀";
    if (currentCount < dailyGoal) return "Почти у цели! 🎯";
    return "Цель достигнута! Легенда! 🏆";
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-6 max-w-md mx-auto">
      {/* Progress Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Прогресс к цели</span>
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
                Время тренировки
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
            🏆 Цель достигнута!
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
            Начать
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            size="lg"
            className="flex-1 h-12"
          >
            <Pause className="h-5 w-5 mr-2" />
            Пауза
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
          Сброс
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
          Сохранить тренировку
        </Button>
      )}

      {/* Hints */}
      <div className="text-center space-y-2">
        {!isActive && currentCount === 0 && (
          <p className="text-sm text-muted-foreground">
            Нажмите "Начать" чтобы запустить тренировку
          </p>
        )}
        {isActive && (
          <p className="text-sm text-muted-foreground">
            Нажимайте на большую кнопку для подсчета отжиманий
          </p>
        )}
      </div>
    </div>
  );
};
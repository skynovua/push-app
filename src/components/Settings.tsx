import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Target, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkoutStore } from '../hooks/useWorkoutStore';
import { useWorkoutData } from '../hooks/useWorkoutData';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useWorkoutStore();
  const { sessions, totalPushUps } = useWorkoutData();
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());

  useEffect(() => {
    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGoalInput(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      updateSettings({ dailyGoal: numValue });
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    updateSettings({ darkMode: checked });
  };

  const handleSoundToggle = (checked: boolean) => {
    updateSettings({ soundEnabled: checked });
  };

  const handleAutoSaveToggle = (checked: boolean) => {
    updateSettings({ autoSave: checked });
  };

  const exportData = () => {
    const dataToExport = {
      sessions,
      settings,
      exportDate: new Date().toISOString(),
      totalPushUps,
      version: '1.0'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pushup-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Настройки
        </h2>
        <p className="text-muted-foreground">Персонализация приложения</p>
      </div>

      {/* Goal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Цели тренировок
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="daily-goal" className="text-sm font-medium">
              Дневная цель отжиманий
            </label>
            <input
              id="daily-goal"
              type="number"
              min="1"
              max="1000"
              value={goalInput}
              onChange={handleGoalChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Рекомендуется: 20-100 отжиманий в день
            </p>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки приложения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="font-medium">Темная тема</div>
                <div className="text-sm text-muted-foreground">
                  Переключение между светлой и темной темой
                </div>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              <div>
                <div className="font-medium">Звуковые уведомления</div>
                <div className="text-sm text-muted-foreground">
                  Звук при нажатии на счетчик
                </div>
              </div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={handleSoundToggle}
            />
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5" />
              <div>
                <div className="font-medium">Автосохранение</div>
                <div className="text-sm text-muted-foreground">
                  Автоматически сохранять тренировки
                </div>
              </div>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={handleAutoSaveToggle}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Управление данными</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">Тренировок</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{totalPushUps}</div>
              <div className="text-sm text-muted-foreground">Отжиманий</div>
            </div>
          </div>
          
          <Button
            onClick={exportData}
            variant="outline"
            className="w-full"
            disabled={sessions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт данных
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Экспорт создаст JSON файл с вашими данными
          </p>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>О приложении</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Версия:</span>
            <Badge variant="secondary">1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Тип:</span>
            <Badge variant="secondary">PWA</Badge>
          </div>
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              Push-Up Counter - ваш персональный тренер для отжиманий
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Warning */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Опасная зона</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Будьте осторожны с этими действиями. Они могут удалить ваши данные.
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (confirm('Вы действительно хотите очистить все данные? Это действие нельзя отменить.')) {
                // Clear all data logic would go here
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Очистить все данные
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

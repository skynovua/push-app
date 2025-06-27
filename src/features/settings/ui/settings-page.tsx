import React, { useState } from 'react';
import {
  Archive,
  Calendar,
  Download,
  Globe,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Target,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react';

import {
  clearUserDataSafely,
  dbUtils,
  pwaService,
  showToast,
  useT,
  useTheme,
  useTranslation,
} from '@/shared/lib';
import { useWorkoutData, useWorkoutStore } from '@/shared/model';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
// Shared imports
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { IOSPWAStatus } from '@/shared/ui/ios-pwa-status';
import { Switch } from '@/shared/ui/switch';

import { ImportDialog } from './import-dialog';

export const SettingsFeature: React.FC = () => {
  const { settings, updateSettings } = useWorkoutStore();
  const { sessions, totalPushUps, clearAllData, deleteSessionsByDate } = useWorkoutData();
  const t = useT();
  const { locale, setLocale } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());

  // === Settings Handlers ===

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGoalInput(value);

    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      updateSettings({ dailyGoal: numValue });
    }
  };

  // Use theme hook instead of direct settings update
  const handleDarkModeToggle = () => {
    toggleTheme();
  };

  const handleSoundToggle = (checked: boolean) => {
    updateSettings({ soundEnabled: checked });
  };

  const handleAutoSaveToggle = (checked: boolean) => {
    updateSettings({ autoSave: checked });
  };

  const handleLanguageChange = (newLocale: 'ua' | 'en') => {
    setLocale(newLocale);
    updateSettings({ language: newLocale });
  };

  // === PWA Installation ===

  const handleInstallPWA = async () => {
    await pwaService.install();
  };

  // === Data Management Functions ===

  const handleDeleteOldSessions = async () => {
    if (confirm(t.stats.deleteOldSessions || 'Видалити тренування старіше 30 днів?')) {
      try {
        await dbUtils.deleteOldSessions(30);
        showToast.success(t.stats.oldSessionsDeleted || 'Старі тренування видалено!');
      } catch (error) {
        console.error('Error deleting old sessions:', error);
        showToast.error(
          t.stats.errorDeletingOldSessions || 'Помилка при видаленні старих тренувань'
        );
      }
    }
  };

  const handleDeleteTodaySessions = async () => {
    if (confirm(t.stats.deleteTodaySessions || 'Видалити тренування сьогоднішнього дня?')) {
      try {
        const today = new Date();
        const success = await deleteSessionsByDate(today);
        if (success) {
          showToast.success(t.stats.todaySessionsDeleted || 'Сьогоднішні тренування видалено!');
        } else {
          showToast.error(t.stats.errorDeletingSessions || 'Помилка при видаленні тренувань');
        }
      } catch (error) {
        console.error('Error deleting today sessions:', error);
        showToast.error(t.stats.errorDeletingSessions || 'Помилка при видаленні тренувань');
      }
    }
  };

  const handleClearAllData = async () => {
    if (confirm(t.settings.confirmClear)) {
      const success = await clearAllData();
      if (success) {
        await clearUserDataSafely();
        showToast.success(t.settings.dataCleared);
      } else {
        showToast.error(t.settings.errorClearing);
      }
    }
  };

  const exportData = () => {
    const dataToExport = {
      sessions,
      settings,
      exportDate: new Date().toISOString(),
      totalPushUps,
      version: '1.0',
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
    <div className="space-y-6 py-6">
      <div className="mb-6 text-center">
        <h2 className="flex items-center justify-center gap-2 text-3xl font-bold">
          <SettingsIcon className="h-8 w-8" />
          {t.settings.title}
        </h2>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t.settings.language}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={locale === 'ua' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('ua')}
              className="flex-1"
            >
              {t.settings.ukrainian}
            </Button>
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageChange('en')}
              className="flex-1"
            >
              {t.settings.english}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* iOS PWA Status */}
      <IOSPWAStatus onInstallClick={handleInstallPWA} />

      {/* Goal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t.settings.workout}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="daily-goal" className="text-sm font-medium">
              {t.settings.dailyGoalLabel}
            </label>
            <input
              id="daily-goal"
              type="number"
              min="1"
              max="1000"
              value={goalInput}
              onChange={handleGoalChange}
              className="border-input bg-background text-foreground w-full rounded-md border px-3 py-2"
            />
            <p className="text-muted-foreground text-xs">{t.settings.goalRecommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appearance}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="font-medium">
                  {isDarkMode ? t.settings.darkMode : t.settings.lightMode}
                </div>
                <div className="text-muted-foreground text-sm">{t.settings.themeDescription}</div>
              </div>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
              <div>
                <div className="font-medium">
                  {settings.soundEnabled ? t.settings.soundEnabled : t.settings.soundDisabled}
                </div>
                <div className="text-muted-foreground text-sm">{t.settings.soundDescription}</div>
              </div>
            </div>
            <Switch checked={settings.soundEnabled} onCheckedChange={handleSoundToggle} />
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5" />
              <div>
                <div className="font-medium">{t.settings.autoSave}</div>
                <div className="text-muted-foreground text-sm">
                  {t.settings.autoSaveDescription}
                </div>
              </div>
            </div>
            <Switch checked={settings.autoSave} onCheckedChange={handleAutoSaveToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.data}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-muted-foreground text-sm">{t.stats.totalSessions}</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{totalPushUps}</div>
              <div className="text-muted-foreground text-sm">{t.stats.totalPushUps}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={exportData}
              variant="outline"
              className="w-full"
              disabled={sessions.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              {t.settings.exportData}
            </Button>

            <ImportDialog
              trigger={
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  {t.settings.importData}
                </Button>
              }
            />
          </div>

          <p className="text-muted-foreground text-center text-xs">
            {t.settings.exportDescription}
          </p>

          {/* Додаткові функції управління даними */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button
              onClick={handleDeleteOldSessions}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Archive className="mr-2 h-4 w-4" />
              {t.settings.deleteOldData}
            </Button>

            <Button
              onClick={handleDeleteTodaySessions}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t.settings.deleteTodayData}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.databaseStats}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold">{sessions.length}</div>
              <div className="text-muted-foreground text-xs">{t.settings.recordsCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">
                {Math.round((sessions.length * 200) / 1024)} KB
              </div>
              <div className="text-muted-foreground text-xs">{t.settings.estimatedSize}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.appInfo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t.settings.version}:</span>
            <Badge variant="secondary">1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t.settings.appType}:</span>
            <Badge variant="secondary">PWA</Badge>
          </div>
          <div className="pt-4 text-center">
            <p className="text-muted-foreground text-sm">{t.settings.appDescription}</p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Warning */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">{t.settings.dangerZone}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">{t.settings.dangerWarning}</p>
          <Button variant="destructive" className="w-full" onClick={handleClearAllData}>
            {t.settings.clearData}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

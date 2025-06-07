import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Target, Download, Globe, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImportDialog } from './ImportDialog';
import { useWorkoutStore } from '../hooks/useWorkoutStore';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { useT, useTranslation } from '../hooks/useTranslation';
import { useToast } from '../utils/toast';
import { pwaService } from '../services/pwa';
import { clearUserDataSafely } from '../lib/utils';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useWorkoutStore();
  const { sessions, totalPushUps, clearAllData, deleteSessionsByDate } = useWorkoutData();
  const t = useT();
  const { locale, setLocale } = useTranslation();
  const { addToast } = useToast();
  const [goalInput, setGoalInput] = useState(settings.dailyGoal.toString());
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  useEffect(() => {
    // Check PWA installation status
    setCanInstallPWA(pwaService.canInstall());
    setIsInstalled(pwaService.isAppInstalled());
  }, []);

  // === Settings Handlers ===
  
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

  const handleLanguageChange = (newLocale: 'ua' | 'en') => {
    setLocale(newLocale);
    updateSettings({ language: newLocale });
  };

  // === PWA Installation ===
  
  const handleInstallPWA = async () => {
    const success = await pwaService.install();
    if (success) {
      setCanInstallPWA(false);
      setIsInstalled(true);
    }
  };

  // === Data Management Functions ===
  
  const handleDeleteOldSessions = async () => {
    if (confirm(t.stats.deleteOldSessions || 'Видалити тренування старіше 30 днів?')) {
      try {
        const { dbUtils } = await import('../services/database');
        await dbUtils.deleteOldSessions(30);
        addToast({
          type: 'success',
          title: t.common.success || 'Успішно',
          description: t.stats.oldSessionsDeleted || 'Старі тренування видалено!'
        });
      } catch (error) {
        console.error('Error deleting old sessions:', error);
        addToast({
          type: 'error',
          title: t.common.error || 'Помилка',
          description: t.stats.errorDeletingOldSessions || 'Помилка при видаленні старих тренувань'
        });
      }
    }
  };

  const handleDeleteTodaySessions = async () => {
    if (confirm(t.stats.deleteTodaySessions || 'Видалити тренування сьогоднішнього дня?')) {
      try {
        const today = new Date();
        const success = await deleteSessionsByDate(today);
        if (success) {
          addToast({
            type: 'success',
            title: t.common.success || 'Успішно',
            description: t.stats.todaySessionsDeleted || 'Сьогоднішні тренування видалено!'
          });
        } else {
          addToast({
            type: 'error',
            title: t.common.error || 'Помилка',
            description: t.stats.errorDeletingSessions || 'Помилка при видаленні тренувань'
          });
        }
      } catch (error) {
        console.error('Error deleting today sessions:', error);
        addToast({
          type: 'error',
          title: t.common.error || 'Помилка',
          description: t.stats.errorDeletingSessions || 'Помилка при видаленні тренувань'
        });
      }
    }
  };

  const handleClearAllData = async () => {
    if (confirm(t.settings.confirmClear)) {
      const success = await clearAllData();
      if (success) {
        addToast({
          type: 'success',
          title: t.common.success || 'Успішно',
          description: t.settings.dataCleared
        });
        // Безпечно очищуємо localStorage, зберігаючи навігацію та налаштування
        clearUserDataSafely();
        // Залишаємося в налаштуваннях після очищення
      } else {
        addToast({
          type: 'error',
          title: t.common.error || 'Помилка',
          description: t.settings.errorClearing
        });
      }
    }
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
    <div className="py-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
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

      {/* PWA Installation */}
      {(canInstallPWA || !isInstalled) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t.settings.pwaInstallation}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t.settings.pwaDescription}
              </p>
              <Button
                onClick={handleInstallPWA}
                className="w-full"
                disabled={isInstalled}
              >
                <Download className="h-4 w-4 mr-2" />
                {isInstalled ? t.settings.appInstalled : t.settings.installApp}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              {t.settings.goalRecommendation}
            </p>
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
              {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <div className="font-medium">{settings.darkMode ? t.settings.darkMode : t.settings.lightMode}</div>
                <div className="text-sm text-muted-foreground">
                  {t.settings.themeDescription}
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
                <div className="font-medium">{settings.soundEnabled ? t.settings.soundEnabled : t.settings.soundDisabled}</div>
                <div className="text-sm text-muted-foreground">
                  {t.settings.soundDescription}
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
                <div className="font-medium">{t.settings.autoSave}</div>
                <div className="text-sm text-muted-foreground">
                  {t.settings.autoSaveDescription}
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
          <CardTitle>{t.settings.data}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold">{sessions.length}</div>
              <div className="text-sm text-muted-foreground">{t.stats.totalSessions}</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{totalPushUps}</div>
              <div className="text-sm text-muted-foreground">{t.stats.totalPushUps}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={exportData}
              variant="outline"
              className="w-full"
              disabled={sessions.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {t.settings.exportData}
            </Button>
            
            <ImportDialog
              trigger={
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {t.settings.importData}
                </Button>
              }
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {t.settings.exportDescription}
          </p>
          
          {/* Додаткові функції управління даними */}
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button
              onClick={handleDeleteOldSessions}
              variant="outline"
              size="sm"
              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950"
            >
              🗂️ {t.settings.deleteOldData}
            </Button>
            
            <Button
              onClick={handleDeleteTodaySessions}
              variant="outline"
              size="sm"
              className="w-full text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950"
            >
              📅 {t.settings.deleteTodayData}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Статистика бази даних */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.databaseStats}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold">{sessions.length}</div>
              <div className="text-xs text-muted-foreground">{t.settings.recordsCount}</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">
                {Math.round((sessions.length * 200) / 1024)} KB
              </div>
              <div className="text-xs text-muted-foreground">{t.settings.estimatedSize}</div>
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
            <span className="text-sm text-muted-foreground">{t.settings.version}:</span>
            <Badge variant="secondary">1.0.0</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t.settings.appType}:</span>
            <Badge variant="secondary">PWA</Badge>
          </div>
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              {t.settings.appDescription}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Warning */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">{t.settings.dangerZone}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.settings.dangerWarning}
          </p>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleClearAllData}
          >
            {t.settings.clearData}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

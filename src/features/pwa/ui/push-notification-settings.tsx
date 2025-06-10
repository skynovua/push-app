import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check, Clock, Settings, Target, Trophy, X, Zap } from 'lucide-react';

import {
  localNotificationService,
  type LocalNotificationSettings,
} from '@/shared/lib/local-notification-service';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';

interface PushNotificationSettingsProps {
  onSettingsChange?: (settings: LocalNotificationSettings) => void;
}

/**
 * Push Notification Settings Component
 *
 * Provides comprehensive UI for configuring all types of push notifications
 * including workout reminders, goal notifications, achievements, and motivational messages.
 */
export const PushNotificationSettingsPanel: React.FC<PushNotificationSettingsProps> = ({
  onSettingsChange,
}) => {
  const [settings, setSettings] = useState<LocalNotificationSettings>(
    localNotificationService.getSettings()
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default'>(
    'default'
  );

  useEffect(() => {
    // Check initial permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Check subscription status
    setIsSubscribed(localNotificationService.isNotificationSupported());
  }, []);

  /**
   * Handle enabling/disabling push notifications
   */
  const handleEnableNotifications = async (enabled: boolean) => {
    if (enabled) {
      setIsLoading(true);
      const success = await localNotificationService.requestPermission();

      if (success) {
        setIsSubscribed(true);
        setPermissionStatus('granted');
        updateSettings({ enabled: true });
      } else {
        setPermissionStatus('denied');
      }
      setIsLoading(false);
    } else {
      await localNotificationService.clearAllNotifications();
      setIsSubscribed(false);
      updateSettings({ enabled: false });
    }
  };

  /**
   * Update settings and propagate changes
   */
  const updateSettings = (newSettings: Partial<LocalNotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localNotificationService.updateSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  /**
   * Handle workout reminders settings
   */
  const handleWorkoutReminderChange = (
    field: string,
    value: string | number | boolean | number[]
  ) => {
    updateSettings({
      workoutReminders: {
        ...settings.workoutReminders,
        [field]: value,
      },
    });
  };

  /**
   * Handle goal reminders settings
   */
  const handleGoalReminderChange = (field: string, value: string | number | boolean) => {
    updateSettings({
      goalReminders: {
        ...settings.goalReminders,
        [field]: value,
      },
    });
  };

  /**
   * Handle achievement settings
   */
  const handleAchievementChange = (field: string, value: boolean) => {
    updateSettings({
      achievements: {
        ...settings.achievements,
        [field]: value,
      },
    });
  };

  /**
   * Handle motivational settings
   */
  const handleMotivationalChange = (field: string, value: string | boolean | number[]) => {
    updateSettings({
      motivational: {
        ...settings.motivational,
        [field]: value,
      },
    });
  };

  /**
   * Toggle day of week for workout reminders
   */
  const toggleWorkoutDay = (day: number) => {
    const currentDays = settings.workoutReminders.daysOfWeek;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: number) => d !== day)
      : [...currentDays, day].sort();

    handleWorkoutReminderChange('daysOfWeek', newDays);
  };

  /**
   * Toggle day of week for motivational messages
   */
  const toggleMotivationalDay = (day: number) => {
    const currentDays = settings.motivational.customDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d: number) => d !== day)
      : [...currentDays, day].sort();

    handleMotivationalChange('customDays', newDays);
  };

  const daysOfWeek = [
    { value: 0, label: 'Пн' },
    { value: 1, label: 'Вт' },
    { value: 2, label: 'Ср' },
    { value: 3, label: 'Чт' },
    { value: 4, label: 'Пт' },
    { value: 5, label: 'Сб' },
    { value: 6, label: 'Нд' },
  ];

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: `${hour}:00`, label: `${hour}:00` };
  });

  return (
    <div className="space-y-6">
      {/* Main Enable/Disable Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-blue-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            Push нотифікації
            <Badge variant={settings.enabled ? 'default' : 'secondary'}>
              {settings.enabled ? 'Увімкнено' : 'Вимкнено'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Permission Status */}
            {permissionStatus === 'denied' && (
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                  <X className="h-4 w-4" />
                  Нотифікації заблоковані в браузері. Увімкніть їх у налаштуваннях.
                </div>
              </div>
            )}

            {permissionStatus === 'granted' && isSubscribed && (
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <Check className="h-4 w-4" />
                  Підписка на нотифікації активна
                </div>
              </div>
            )}

            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Увімкнути push нотифікації</h3>
                <p className="text-muted-foreground text-sm">
                  Отримуйте нагадування про тренування та досягнення
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleEnableNotifications}
                disabled={isLoading || permissionStatus === 'denied'}
              />
            </div>

            {/* Test Notification Button */}
            {settings.enabled && isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localNotificationService.sendTestNotification();
                }}
              >
                📱 Тестувати нотифікацію
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections - Only show if notifications are enabled */}
      {settings.enabled && isSubscribed && (
        <>
          {/* Workout Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                Нагадування про тренування
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Щоденні нагадування</h3>
                  <p className="text-muted-foreground text-sm">Нагадування у встановлений час</p>
                </div>
                <Switch
                  checked={settings.workoutReminders.enabled}
                  onCheckedChange={(enabled) => handleWorkoutReminderChange('enabled', enabled)}
                />
              </div>

              {settings.workoutReminders.enabled && (
                <>
                  {/* Time Selection */}
                  <div>
                    <label className="text-sm font-medium">Час нагадування</label>
                    <select
                      value={settings.workoutReminders.time}
                      onChange={(e) => handleWorkoutReminderChange('time', e.target.value)}
                      className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Days Selection */}
                  <div>
                    <label className="text-sm font-medium">Дні тижня</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Button
                          key={day.value}
                          variant={
                            settings.workoutReminders.daysOfWeek.includes(day.value)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => toggleWorkoutDay(day.value)}
                          className="h-8 w-12"
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Message */}
                  <div>
                    <label className="text-sm font-medium">
                      Персональне повідомлення (опціонально)
                    </label>
                    <input
                      type="text"
                      value={settings.workoutReminders.customMessage || ''}
                      onChange={(e) => handleWorkoutReminderChange('customMessage', e.target.value)}
                      placeholder="Час для віджимань! 💪"
                      className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Goal Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-5 w-5 text-red-500" />
                Нагадування про цілі
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Нагадування про денну ціль</h3>
                  <p className="text-muted-foreground text-sm">Повідомлення перед кінцем дня</p>
                </div>
                <Switch
                  checked={settings.goalReminders.enabled}
                  onCheckedChange={(enabled) => handleGoalReminderChange('enabled', enabled)}
                />
              </div>

              {settings.goalReminders.enabled && (
                <div>
                  <label className="text-sm font-medium">
                    За скільки годин до кінця дня нагадувати
                  </label>
                  <select
                    value={settings.goalReminders.timeBeforeDeadline}
                    onChange={(e) =>
                      handleGoalReminderChange('timeBeforeDeadline', Number(e.target.value))
                    }
                    className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value={1}>1 година</option>
                    <option value={2}>2 години</option>
                    <option value={3}>3 години</option>
                    <option value={4}>4 години</option>
                    <option value={6}>6 годин</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievement Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Досягнення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Повідомлення про досягнення</h3>
                  <p className="text-muted-foreground text-sm">
                    Сповіщення про нові рекорди та етапи
                  </p>
                </div>
                <Switch
                  checked={settings.achievements.enabled}
                  onCheckedChange={(enabled) => handleAchievementChange('enabled', enabled)}
                />
              </div>

              {settings.achievements.enabled && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Показувати етапи (10, 50, 100 віджимань)</span>
                    <Switch
                      checked={settings.achievements.showMilestones}
                      onCheckedChange={(enabled) =>
                        handleAchievementChange('showMilestones', enabled)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Показувати серії (streak)</span>
                    <Switch
                      checked={settings.achievements.showStreaks}
                      onCheckedChange={(enabled) => handleAchievementChange('showStreaks', enabled)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Motivational Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-500" />
                Мотиваційні повідомлення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Мотиваційні цитати</h3>
                  <p className="text-muted-foreground text-sm">
                    Надихаючі повідомлення для підтримки мотивації
                  </p>
                </div>
                <Switch
                  checked={settings.motivational.enabled}
                  onCheckedChange={(enabled) => handleMotivationalChange('enabled', enabled)}
                />
              </div>

              {settings.motivational.enabled && (
                <>
                  {/* Frequency */}
                  <div>
                    <label className="text-sm font-medium">Частота</label>
                    <select
                      value={settings.motivational.frequency}
                      onChange={(e) => handleMotivationalChange('frequency', e.target.value)}
                      className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    >
                      <option value="daily">Щодня</option>
                      <option value="weekly">Щотижня</option>
                      <option value="custom">Власний графік</option>
                    </select>
                  </div>

                  {/* Custom Days Selection */}
                  {settings.motivational.frequency === 'custom' && (
                    <div>
                      <label className="text-sm font-medium">Оберіть дні</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <Button
                            key={day.value}
                            variant={
                              (settings.motivational.customDays || []).includes(day.value)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => toggleMotivationalDay(day.value)}
                            className="h-8 w-12"
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Selection */}
                  <div>
                    <label className="text-sm font-medium">Час відправки</label>
                    <select
                      value={settings.motivational.time || '09:00'}
                      onChange={(e) => handleMotivationalChange('time', e.target.value)}
                      className="border-input bg-background mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-500" />
                Додаткові налаштування
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => localNotificationService.clearAllNotifications()}
                className="w-full"
              >
                🗑️ Очистити всі заплановані нотифікації
              </Button>

              <div className="text-muted-foreground text-xs">
                <p>• Нотифікації працюють тільки коли додаток встановлено як PWA</p>
                <p>• Перевірте налаштування нотифікацій у вашому браузері</p>
                <p>• На iOS нотифікації працюють тільки в Safari</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

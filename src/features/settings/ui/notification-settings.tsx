import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Calendar, Clock, TestTube } from 'lucide-react';

import {
  notificationService,
  type NotificationPermissionResult,
  type ReminderSettings,
} from '@/shared/lib/notification-service';
import { useT, useTranslation } from '@/shared/lib/translation';
import { useWorkoutStore } from '@/shared/model/workout-store';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Switch } from '@/shared/ui/switch';

export const NotificationSettings: React.FC = () => {
  const { settings, updateSettings } = useWorkoutStore();
  const t = useT();
  const { locale } = useTranslation();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionResult>({
    granted: false,
    supported: false,
  });
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: false,
    time: settings.reminderTime || '18:00',
    daysOfWeek: [0, 1, 2, 3, 4], // Monday to Friday by default (0 = Monday in our new system)
  });
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  // Load notification permission status on mount
  useEffect(() => {
    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);

    // Load reminder settings from app settings
    console.warn('Loading settings:', {
      reminderTime: settings.reminderTime,
      daysOfWeek: settings.daysOfWeek,
    });
    setReminderSettings((prev) => ({
      ...prev,
      time: settings.reminderTime || '18:00',
      enabled: !!settings.reminderTime,
      daysOfWeek: settings.daysOfWeek || [0, 1, 2, 3, 4], // Monday to Friday by default
    }));
  }, [settings.reminderTime, settings.daysOfWeek]);

  // Schedule reminders when settings change
  useEffect(() => {
    if (permissionStatus.granted && reminderSettings.enabled) {
      notificationService.scheduleWorkoutReminder(reminderSettings);
    } else {
      notificationService.clearScheduledReminder();
    }
  }, [permissionStatus.granted, reminderSettings]);

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermission();
    setPermissionStatus(result);

    if (result.granted) {
      // Auto-enable reminders if permission is granted
      setReminderSettings((prev) => ({ ...prev, enabled: true }));
    }
  };

  const handleReminderToggle = async (enabled: boolean) => {
    if (enabled && !permissionStatus.granted) {
      // Request permission first
      const result = await notificationService.requestPermission();
      setPermissionStatus(result);

      if (!result.granted) {
        return; // Don't enable if permission not granted
      }
    }

    const newSettings = { ...reminderSettings, enabled };
    setReminderSettings(newSettings);

    // Save to app settings - always preserve daysOfWeek, only toggle reminderTime
    await updateSettings({
      reminderTime: enabled ? newSettings.time : undefined,
      daysOfWeek: newSettings.daysOfWeek, // Always save days of week
    });
  };

  const handleTimeChange = async (time: string) => {
    const newSettings = { ...reminderSettings, time };
    setReminderSettings(newSettings);

    // Save to app settings if reminders are enabled
    if (newSettings.enabled) {
      await updateSettings({ reminderTime: time });
    }
  };

  const handleDayToggle = async (day: number) => {
    const newDays = reminderSettings.daysOfWeek.includes(day)
      ? reminderSettings.daysOfWeek.filter((d) => d !== day)
      : [...reminderSettings.daysOfWeek, day].sort();

    const newSettings = { ...reminderSettings, daysOfWeek: newDays };
    setReminderSettings(newSettings);

    // Save to app settings
    console.warn('Saving daysOfWeek:', newDays);
    await updateSettings({ daysOfWeek: newDays });
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      const success = await notificationService.testNotification();
      if (!success && !permissionStatus.granted) {
        const result = await notificationService.requestPermission();
        setPermissionStatus(result);
      }
    } catch (error) {
      console.error('Test notification failed:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  // Days starting from Monday (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  const dayNamesEn = ['M', 'T', 'W', 'T', 'F', 'S', 'Su'];
  const currentDayNames = locale === 'ua' ? dayNames : dayNamesEn;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {permissionStatus.granted ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {t.settings.notifications.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t.settings.notifications.permission}</div>
              <div className="text-muted-foreground text-sm">
                {t.settings.notifications.permissionDescription}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={permissionStatus.granted ? 'default' : 'secondary'}>
                {permissionStatus.granted
                  ? t.settings.notifications.granted
                  : t.settings.notifications.notGranted}
              </Badge>
              {!permissionStatus.granted && permissionStatus.supported && (
                <Button size="sm" onClick={handleRequestPermission} variant="outline">
                  {t.settings.notifications.requestPermission}
                </Button>
              )}
            </div>
          </div>

          {!permissionStatus.supported && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {t.settings.notifications.notSupported}
              </p>
            </div>
          )}
        </div>

        {/* Test Notification */}
        {permissionStatus.supported && (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{t.settings.notifications.testNotification}</div>
              <div className="text-muted-foreground text-sm">
                {t.settings.notifications.testDescription}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestNotification}
              disabled={isTestingNotification}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isTestingNotification
                ? t.settings.notifications.testing
                : t.settings.notifications.test}
            </Button>
          </div>
        )}

        {/* Workout Reminders */}
        {permissionStatus.supported && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5" />
                <div>
                  <div className="font-medium">{t.settings.notifications.workoutReminders}</div>
                  <div className="text-muted-foreground text-sm">
                    {t.settings.notifications.reminderDescription}
                  </div>
                </div>
              </div>
              <Switch
                checked={reminderSettings.enabled && permissionStatus.granted}
                onCheckedChange={handleReminderToggle}
                disabled={!permissionStatus.supported}
              />
            </div>

            {/* Reminder Time Settings */}
            {reminderSettings.enabled && permissionStatus.granted && (
              <div className="space-y-4 pl-8">
                {/* Time Picker */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t.settings.notifications.reminderTime}
                  </label>
                  <input
                    type="time"
                    value={reminderSettings.time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="border-input bg-background text-foreground w-full max-w-32 rounded-md border px-3 py-2"
                  />
                </div>

                {/* Days of Week */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {t.settings.notifications.reminderDays}
                  </label>
                  <div className="flex gap-2">
                    {currentDayNames.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayToggle(index)}
                        className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                          reminderSettings.daysOfWeek.includes(index)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {t.settings.notifications.daysDescription}
                  </p>
                </div>

                {/* Current Schedule Info */}
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    <strong>{t.settings.notifications.nextReminder}:</strong>{' '}
                    {reminderSettings.daysOfWeek.length > 0
                      ? `${t.settings.notifications.daily} ${reminderSettings.time}`
                      : t.settings.notifications.noSchedule}
                  </p>
                  {reminderSettings.daysOfWeek.length > 0 && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {t.settings.notifications.activeDays}:{' '}
                      {reminderSettings.daysOfWeek.map((d) => currentDayNames[d]).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

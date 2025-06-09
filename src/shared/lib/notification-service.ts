// Notification service for workout reminders and push notifications

export interface NotificationPermissionResult {
  granted: boolean;
  supported: boolean;
  error?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM"
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
  lastScheduled?: Date;
}

class NotificationService {
  private scheduledTimeout: NodeJS.Timeout | null = null;
  private isServiceWorkerReady = false;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if service worker is available
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        this.isServiceWorkerReady = !!registration;
      } catch (error) {
        console.warn('Service worker not ready:', error);
      }
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermissionResult> {
    if (!('Notification' in window)) {
      return {
        granted: false,
        supported: false,
        error: 'Notifications not supported in this browser',
      };
    }

    try {
      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      return {
        granted: permission === 'granted',
        supported: true,
      };
    } catch (error) {
      return {
        granted: false,
        supported: true,
        error: error instanceof Error ? error.message : 'Permission request failed',
      };
    }
  }

  /**
   * Check current notification permission status
   */
  getPermissionStatus(): NotificationPermissionResult {
    if (!('Notification' in window)) {
      return {
        granted: false,
        supported: false,
        error: 'Notifications not supported',
      };
    }

    return {
      granted: Notification.permission === 'granted',
      supported: true,
    };
  }

  /**
   * Show immediate notification
   */
  async showNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    const permissionResult = this.getPermissionStatus();

    if (!permissionResult.granted) {
      console.warn('Cannot show notification: permission not granted');
      return false;
    }

    try {
      // Use service worker notification if available
      if (this.isServiceWorkerReady && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options,
        });
      } else {
        // Fallback to basic notification
        new Notification(title, {
          icon: '/icon-192x192.png',
          ...options,
        });
      }
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }

  /**
   * Schedule workout reminder for specific time
   */
  scheduleWorkoutReminder(settings: ReminderSettings): void {
    this.clearScheduledReminder();

    if (!settings.enabled || !settings.time) {
      return;
    }

    const scheduleNext = () => {
      const now = new Date();
      const [hours, minutes] = settings.time.split(':').map(Number);

      // Find next occurrence of the reminder time
      const nextReminder = new Date();
      nextReminder.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow or next allowed day
      if (nextReminder <= now) {
        nextReminder.setDate(nextReminder.getDate() + 1);
      }

      // Check if reminder is allowed on this day of week
      while (
        settings.daysOfWeek.length > 0 &&
        !settings.daysOfWeek.includes(nextReminder.getDay())
      ) {
        nextReminder.setDate(nextReminder.getDate() + 1);
      }

      const timeUntilReminder = nextReminder.getTime() - now.getTime();

      // Schedule the reminder
      this.scheduledTimeout = setTimeout(async () => {
        await this.showWorkoutReminder();
        // Schedule the next reminder
        scheduleNext();
      }, timeUntilReminder);

      console.warn(`Next workout reminder scheduled for: ${nextReminder.toLocaleString()}`);
    };

    scheduleNext();
  }

  /**
   * Clear any scheduled reminders
   */
  clearScheduledReminder(): void {
    if (this.scheduledTimeout) {
      clearTimeout(this.scheduledTimeout);
      this.scheduledTimeout = null;
    }
  }

  /**
   * Show workout reminder notification
   */
  private async showWorkoutReminder(): Promise<void> {
    const permissionResult = this.getPermissionStatus();

    if (!permissionResult.granted) {
      return;
    }

    // Get current language from localStorage or default to 'ua'
    const storedLocale = localStorage.getItem('app-language') || 'ua';

    // Import locales dynamically
    const { locales } = await import('../locales');
    const t = locales[storedLocale as keyof typeof locales];

    await this.showNotification(t.settings.notifications.workoutReminder, {
      body: t.settings.notifications.reminderText,
      tag: 'workout-reminder',
      requireInteraction: true,
      data: {
        type: 'workout-reminder',
        url: '/',
      },
    });
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<boolean> {
    const permissionResult = await this.requestPermission();

    if (!permissionResult.granted) {
      return false;
    }

    // Get current language from localStorage or default to 'ua'
    const storedLocale = localStorage.getItem('app-language') || 'ua';

    // Import locales dynamically
    const { locales } = await import('../locales');
    const t = locales[storedLocale as keyof typeof locales];

    return await this.showNotification(t.settings.notifications.testNotification, {
      body: t.settings.notifications.testMessage,
      tag: 'test-notification',
    });
  }
}

export const notificationService = new NotificationService();

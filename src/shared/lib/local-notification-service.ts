// Local Notifications Service for Push-Up Counter App

export interface LocalNotificationSettings {
  enabled: boolean;
  workoutReminders: {
    enabled: boolean;
    time: string; // "HH:MM" format
    daysOfWeek: number[]; // 0=Monday, 6=Sunday
    customMessage?: string;
  };
  goalReminders: {
    enabled: boolean;
    timeBeforeDeadline: number; // hours before end of day
  };
  achievements: {
    enabled: boolean;
    showMilestones: boolean;
    showStreaks: boolean;
  };
  motivational: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    customDays?: number[]; // if frequency is 'custom'
    time?: string; // "HH:MM" format
  };
}

export interface NotificationTemplate {
  id: string;
  type: 'workout-reminder' | 'goal-reminder' | 'achievement' | 'motivational';
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface ScheduledNotification {
  id: string;
  template: NotificationTemplate;
  scheduledTime: Date;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[];
  };
}

class LocalNotificationService {
  private static instance: LocalNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private settings: LocalNotificationSettings;
  private notificationTimers: Map<string, number> = new Map();
  private dbName = 'PushUpCounterNotifications';
  private dbVersion = 1;

  constructor() {
    this.settings = this.loadSettings();
    this.init();
  }

  public static getInstance(): LocalNotificationService {
    if (!LocalNotificationService.instance) {
      LocalNotificationService.instance = new LocalNotificationService();
    }
    return LocalNotificationService.instance;
  }

  /**
   * Initialize notification service and setup service worker
   */
  private async init(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.ready;

        // Listen for notification clicks from service worker
        navigator.serviceWorker.addEventListener(
          'message',
          this.handleServiceWorkerMessage.bind(this)
        );

        // Send notification schedule to service worker
        await this.syncWithServiceWorker();
      }

      // Load and reschedule notifications
      await this.loadScheduledNotifications();
      this.rescheduleNotifications();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and permission granted
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Send notification schedule to service worker for background processing
   */
  private async syncWithServiceWorker(): Promise<void> {
    if (!this.registration) return;

    const notifications = Array.from(this.scheduledNotifications.values());
    const serializedNotifications = notifications.map((notification) => ({
      ...notification,
      scheduledTime: notification.scheduledTime.toISOString(),
    }));

    this.registration.active?.postMessage({
      type: 'SYNC_NOTIFICATIONS',
      data: {
        notifications: serializedNotifications,
        settings: this.settings,
      },
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data || {};

    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data);
        break;
      case 'NOTIFICATION_ACTION':
        this.handleNotificationAction(data);
        break;
      case 'NOTIFICATION_SHOWN':
        this.handleNotificationShown(data);
        break;
    }
  }

  /**
   * Handle notification click events
   */
  private handleNotificationClick(data: Record<string, unknown>): void {
    const { notificationType, url } = data;

    switch (notificationType) {
      case 'workout-reminder':
        this.navigateToApp('/');
        break;
      case 'goal-reminder':
        this.navigateToApp('/?tab=stats');
        break;
      case 'achievement':
        this.showAchievementDetails(data);
        break;
      default:
        if (url) {
          this.navigateToApp(url as string);
        }
    }
  }

  /**
   * Handle notification action button clicks
   */
  private handleNotificationAction(data: Record<string, unknown>): void {
    const { action, notificationId } = data;

    switch (action) {
      case 'start-workout':
        this.navigateToApp('/');
        break;
      case 'view-stats':
        this.navigateToApp('/?tab=stats');
        break;
      case 'snooze':
        this.snoozeNotification(notificationId as string);
        break;
      case 'dismiss':
        // Just dismiss, no action needed
        break;
    }
  }

  /**
   * Handle when notification is shown
   */
  private handleNotificationShown(data: Record<string, unknown>): void {
    const { notificationId } = data;

    // If it's a recurring notification, schedule the next occurrence
    const notification = this.scheduledNotifications.get(notificationId as string);
    if (notification?.recurring) {
      this.scheduleNextRecurrence(notification);
    }
  }

  /**
   * Navigate to app or open if closed
   */
  private navigateToApp(url: string): void {
    if ('clients' in self) {
      // Running in service worker context
      return;
    }

    // Check if app is already open
    if (document.visibilityState === 'visible') {
      // App is open, navigate
      window.location.href = url;
    } else {
      // App might be closed, try to focus and navigate
      window.focus();
      window.location.href = url;
    }
  }

  /**
   * Show achievement details
   */
  private showAchievementDetails(data: Record<string, unknown>): void {
    // Navigate to stats with achievement data
    this.navigateToApp(`/?tab=stats&achievement=${encodeURIComponent(JSON.stringify(data))}`);
  }

  /**
   * Snooze notification for a specific time
   */
  private snoozeNotification(notificationId: string, snoozeMinutes: number = 30): void {
    const notification = this.scheduledNotifications.get(notificationId);
    if (notification) {
      const newTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      notification.scheduledTime = newTime;
      this.scheduleNotification(notification);
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  async scheduleNotification(notification: ScheduledNotification): Promise<void> {
    if (!this.isNotificationSupported()) {
      console.warn('Notifications not supported or permission not granted');
      return;
    }

    this.scheduledNotifications.set(notification.id, notification);

    const delay = notification.scheduledTime.getTime() - Date.now();

    // Clear existing timer if any
    const existingTimer = this.notificationTimers.get(notification.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    if (delay > 0) {
      // Schedule for immediate delivery
      const timerId = window.setTimeout(() => {
        this.showLocalNotification(notification.template);
        this.notificationTimers.delete(notification.id);
      }, delay);

      this.notificationTimers.set(notification.id, timerId);
    }

    // Save to persistent storage
    await this.saveScheduledNotifications();
    await this.syncWithServiceWorker();
  }

  /**
   * Schedule next recurrence of a recurring notification
   */
  private scheduleNextRecurrence(notification: ScheduledNotification): void {
    if (!notification.recurring) return;

    const nextTime = this.calculateNextRecurrence(notification);
    if (nextTime) {
      const nextNotification: ScheduledNotification = {
        ...notification,
        scheduledTime: nextTime,
      };
      this.scheduleNotification(nextNotification);
    }
  }

  /**
   * Calculate next recurrence time
   */
  private calculateNextRecurrence(notification: ScheduledNotification): Date | null {
    if (!notification.recurring) return null;

    const currentTime = notification.scheduledTime;

    switch (notification.recurring.type) {
      case 'daily':
        return new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

      case 'weekly':
        return new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);

      case 'monthly': {
        const nextMonth = new Date(currentTime);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      }

      default:
        return null;
    }
  }

  /**
   * Show local notification immediately
   */
  async showLocalNotification(template: NotificationTemplate): Promise<void> {
    if (!this.registration) {
      console.error('Service worker not available');
      return;
    }

    try {
      await this.registration.showNotification(template.title, {
        body: template.body,
        icon: template.icon || '/icon-192x192.png',
        badge: template.badge || '/icon-192x192.png',
        data: {
          notificationType: template.type,
          notificationId: template.id,
          ...template.data,
        },
        actions: template.actions?.map((action) => ({
          action: action.action,
          title: action.title,
          icon: action.icon,
        })),
        requireInteraction: template.requireInteraction,
        silent: template.silent,
        tag: template.id,
      } as NotificationOptions);

      // Notify service worker that notification was shown
      this.registration.active?.postMessage({
        type: 'NOTIFICATION_SHOWN',
        data: { notificationId: template.id },
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings: Partial<LocalNotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.rescheduleNotifications();
    this.syncWithServiceWorker();
  }

  /**
   * Get current notification settings
   */
  getSettings(): LocalNotificationSettings {
    return { ...this.settings };
  }

  /**
   * Reschedule all notifications based on current settings
   */
  private rescheduleNotifications(): void {
    // Clear existing timers
    this.notificationTimers.forEach((timerId) => clearTimeout(timerId));
    this.notificationTimers.clear();
    this.scheduledNotifications.clear();

    if (!this.settings.enabled) return;

    if (this.settings.workoutReminders.enabled) {
      this.scheduleWorkoutReminders();
    }

    if (this.settings.goalReminders.enabled) {
      this.scheduleGoalReminders();
    }

    if (this.settings.motivational.enabled) {
      this.scheduleMotivationalMessages();
    }
  }

  /**
   * Schedule workout reminder notifications
   */
  private scheduleWorkoutReminders(): void {
    const { time, daysOfWeek, customMessage } = this.settings.workoutReminders;
    const [hours, minutes] = time.split(':').map(Number);

    daysOfWeek.forEach((dayOfWeek: number) => {
      const notificationTime = this.getNextDateTime(dayOfWeek, hours, minutes);

      const template: NotificationTemplate = {
        id: `workout-reminder-${dayOfWeek}`,
        type: 'workout-reminder',
        title: '💪 Час для віджимань!',
        body: customMessage || 'Не забувайте про свою денну ціль. Готові до тренування?',
        actions: [
          { action: 'start-workout', title: '🚀 Почати', icon: '/icon-192x192.png' },
          { action: 'snooze', title: '⏰ +30 хв', icon: '/icon-192x192.png' },
          { action: 'dismiss', title: '❌ Закрити', icon: '/icon-192x192.png' },
        ],
        requireInteraction: true,
        data: { dayOfWeek },
      };

      this.scheduleNotification({
        id: template.id,
        template,
        scheduledTime: notificationTime,
        recurring: {
          type: 'weekly',
          daysOfWeek: [dayOfWeek],
        },
      });
    });
  }

  /**
   * Schedule goal reminder notifications
   */
  private scheduleGoalReminders(): void {
    const { timeBeforeDeadline } = this.settings.goalReminders;

    // Schedule daily goal reminders
    const reminderTime = new Date();
    reminderTime.setHours(24 - timeBeforeDeadline, 0, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (reminderTime <= new Date()) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const template: NotificationTemplate = {
      id: 'goal-reminder-daily',
      type: 'goal-reminder',
      title: '🎯 Нагадування про ціль',
      body: `У вас залишилося ${timeBeforeDeadline} год до кінця дня. Як ваш прогрес?`,
      actions: [
        { action: 'view-stats', title: '📊 Статистика', icon: '/icon-192x192.png' },
        { action: 'start-workout', title: '💪 Тренування', icon: '/icon-192x192.png' },
      ],
      requireInteraction: false,
    };

    this.scheduleNotification({
      id: template.id,
      template,
      scheduledTime: reminderTime,
      recurring: { type: 'daily' },
    });
  }

  /**
   * Schedule motivational messages
   */
  private scheduleMotivationalMessages(): void {
    const { frequency, customDays, time } = this.settings.motivational;

    const motivationalMessages = [
      { title: '🔥 Мотивація', body: 'Кожен день - це новий шанс стати сильнішим!' },
      {
        title: '💪 Наполегливість',
        body: 'Не важливо, наскільки повільно ви йдете, головне - не зупинятися!',
      },
      { title: '🏆 Успіх', body: 'Великі досягнення складаються з маленьких перемог!' },
      { title: '⚡ Енергія', body: 'Ваше тіло може витримати це. Переконайте свій розум!' },
      { title: '🎯 Ціль', body: 'Дисципліна - це міст між цілями та досягненнями!' },
    ];

    let daysToSchedule: number[] = [];

    switch (frequency) {
      case 'daily':
        daysToSchedule = [0, 1, 2, 3, 4, 5, 6]; // All days
        break;
      case 'weekly':
        daysToSchedule = [1]; // Tuesdays
        break;
      case 'custom':
        daysToSchedule = customDays || [];
        break;
    }

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);

      daysToSchedule.forEach((dayOfWeek: number) => {
        const messageIndex = dayOfWeek % motivationalMessages.length;
        const message = motivationalMessages[messageIndex];
        const notificationTime = this.getNextDateTime(dayOfWeek, hours, minutes);

        const template: NotificationTemplate = {
          id: `motivational-${dayOfWeek}`,
          type: 'motivational',
          title: message.title,
          body: message.body,
          requireInteraction: false,
          silent: false,
        };

        this.scheduleNotification({
          id: template.id,
          template,
          scheduledTime: notificationTime,
          recurring: { type: 'weekly', daysOfWeek: [dayOfWeek] },
        });
      });
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievement: {
    title: string;
    description: string;
    milestone?: number;
    type: 'streak' | 'milestone' | 'personal_record';
  }): Promise<void> {
    if (!this.settings.achievements.enabled) return;

    const { title, description, milestone, type } = achievement;

    let emoji = '🏆';
    switch (type) {
      case 'streak':
        emoji = '🔥';
        break;
      case 'milestone':
        emoji = '🎯';
        break;
      case 'personal_record':
        emoji = '📈';
        break;
    }

    const template: NotificationTemplate = {
      id: `achievement-${Date.now()}`,
      type: 'achievement',
      title: `${emoji} ${title}`,
      body: description,
      actions: [
        { action: 'view-stats', title: '📊 Переглянути', icon: '/icon-192x192.png' },
        { action: 'dismiss', title: '✨ Супер!', icon: '/icon-192x192.png' },
      ],
      requireInteraction: true,
      data: { achievement, milestone, type },
    };

    await this.showLocalNotification(template);
  }

  /**
   * Get next date/time for a specific day of week and time
   */
  private getNextDateTime(dayOfWeek: number, hours: number, minutes: number): Date {
    const now = new Date();
    const targetDate = new Date();

    // Convert our 0=Monday system to JS 0=Sunday system
    const jsDayOfWeek = dayOfWeek === 6 ? 0 : dayOfWeek + 1;

    targetDate.setHours(hours, minutes, 0, 0);

    const dayDiff = (jsDayOfWeek - now.getDay() + 7) % 7;
    if (dayDiff === 0 && targetDate <= now) {
      // If it's today but time has passed, schedule for next week
      targetDate.setDate(targetDate.getDate() + 7);
    } else {
      targetDate.setDate(targetDate.getDate() + dayDiff);
    }

    return targetDate;
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): LocalNotificationSettings {
    const stored = localStorage.getItem('local-notification-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    }

    // Default settings
    return {
      enabled: false,
      workoutReminders: {
        enabled: false,
        time: '18:00',
        daysOfWeek: [0, 1, 2, 3, 4], // Monday to Friday
      },
      goalReminders: {
        enabled: false,
        timeBeforeDeadline: 3, // 3 hours before end of day
      },
      achievements: {
        enabled: true,
        showMilestones: true,
        showStreaks: true,
      },
      motivational: {
        enabled: false,
        frequency: 'daily',
        time: '09:00',
      },
    };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('local-notification-settings', JSON.stringify(this.settings));
  }

  /**
   * Save scheduled notifications to IndexedDB
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');

      const notifications = Array.from(this.scheduledNotifications.values());
      const serialized = notifications.map((notification) => ({
        ...notification,
        scheduledTime: notification.scheduledTime.toISOString(),
      }));

      const request = store.put({ id: 'scheduled', data: serialized });
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
      // Fallback to localStorage
      this.saveScheduledNotificationsToLocalStorage();
    }
  }

  /**
   * Load scheduled notifications from IndexedDB
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');

      const request = store.get('scheduled');
      const result = await new Promise<{ id: string; data: unknown } | undefined>(
        (resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }
      );

      if (result?.data) {
        const data = result.data as Array<{
          id: string;
          template: NotificationTemplate;
          scheduledTime: string;
          recurring?: {
            type: 'daily' | 'weekly' | 'monthly';
            daysOfWeek?: number[];
          };
        }>;

        data.forEach((item) => {
          this.scheduledNotifications.set(item.id, {
            id: item.id,
            template: item.template,
            scheduledTime: new Date(item.scheduledTime),
            recurring: item.recurring,
          });
        });
      }
    } catch (error) {
      console.error('Error loading scheduled notifications from IndexedDB:', error);
      // Fallback to localStorage
      this.loadScheduledNotificationsFromLocalStorage();
    }
  }

  /**
   * Fallback: Save to localStorage
   */
  private saveScheduledNotificationsToLocalStorage(): void {
    const serialized = Array.from(this.scheduledNotifications.entries()).map(
      ([id, notification]) => ({
        id,
        template: notification.template,
        scheduledTime: notification.scheduledTime.toISOString(),
        recurring: notification.recurring,
      })
    );

    localStorage.setItem('scheduled-notifications', JSON.stringify(serialized));
  }

  /**
   * Fallback: Load from localStorage
   */
  private loadScheduledNotificationsFromLocalStorage(): void {
    const stored = localStorage.getItem('scheduled-notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored) as Array<{
          id: string;
          template: NotificationTemplate;
          scheduledTime: string;
          recurring?: {
            type: 'daily' | 'weekly' | 'monthly';
            daysOfWeek?: number[];
          };
        }>;
        notifications.forEach((item) => {
          this.scheduledNotifications.set(item.id, {
            id: item.id,
            template: item.template,
            scheduledTime: new Date(item.scheduledTime),
            recurring: item.recurring,
          });
        });
      } catch (error) {
        console.error('Error loading scheduled notifications:', error);
      }
    }
  }

  /**
   * Open IndexedDB connection
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('notifications')) {
          db.createObjectStore('notifications', { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Clear all scheduled notifications
   */
  async clearAllNotifications(): Promise<void> {
    // Clear timers
    this.notificationTimers.forEach((timerId) => clearTimeout(timerId));
    this.notificationTimers.clear();

    // Clear memory
    this.scheduledNotifications.clear();

    // Clear IndexedDB
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      await store.delete('scheduled');
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }

    // Clear localStorage fallback
    localStorage.removeItem('scheduled-notifications');

    // Update service worker
    await this.syncWithServiceWorker();
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Test notification (for settings page)
   */
  async sendTestNotification(): Promise<void> {
    const template: NotificationTemplate = {
      id: `test-${Date.now()}`,
      type: 'motivational',
      title: '🧪 Тестова нотифікація',
      body: 'Якщо ви бачите це повідомлення, нотифікації працюють правильно!',
      actions: [{ action: 'dismiss', title: '👍 Супер!', icon: '/icon-192x192.png' }],
      requireInteraction: false,
    };

    await this.showLocalNotification(template);
  }
}

// Export singleton instance
export const localNotificationService = LocalNotificationService.getInstance();

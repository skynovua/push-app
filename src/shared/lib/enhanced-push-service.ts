// Enhanced Push Notifications Service for Push-Up Counter App

export interface PushNotificationSettings {
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

class EnhancedPushService {
  private static instance: EnhancedPushService;
  private subscription: PushSubscription | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private settings: PushNotificationSettings;

  constructor() {
    this.settings = this.loadSettings();
    this.loadScheduledNotifications();
    this.init();
  }

  public static getInstance(): EnhancedPushService {
    if (!EnhancedPushService.instance) {
      EnhancedPushService.instance = new EnhancedPushService();
    }
    return EnhancedPushService.instance;
  }

  /**
   * Initialize push service and setup service worker
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

        // Setup existing subscription if any
        this.subscription = await this.registration.pushManager.getSubscription();
      }
    } catch (error) {
      console.error('Error initializing push service:', error);
    }
  }

  /**
   * Request push notification permission and subscribe
   */
  async requestPermissionAndSubscribe(): Promise<boolean> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      if (!this.registration) {
        throw new Error('Service worker not ready');
      }

      // Check if already subscribed
      this.subscription = await this.registration.pushManager.getSubscription();

      if (!this.subscription) {
        // Subscribe to push notifications
        this.subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.getVAPIDPublicKey(),
        });
      }

      // Send subscription to your server (in real app)
      await this.sendSubscriptionToServer(this.subscription);

      return true;
    } catch (error) {
      console.error('Error requesting push permission:', error);
      return false;
    }
  }

  /**
   * Get VAPID public key for push subscription
   * In production, this should come from environment variables
   */
  private getVAPIDPublicKey(): string {
    // Use environment variable in production, fallback to development key
    return (
      process.env.VITE_VAPID_PUBLIC_KEY ||
      'BEl62iUYgUivxIkv69yViEuiBIa40HI80NwQRAQY5zMOJ2UUczF-UtVlQGgbgQ'
    );
  }

  /**
   * Send subscription to server for push delivery
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // In a real app, send this to your backend server
    // For now, we'll store it locally for demo purposes
    localStorage.setItem('push-subscription', JSON.stringify(subscription.toJSON()));
    // Use console.warn for non-error logging to satisfy ESLint
    if (process.env.NODE_ENV === 'development') {
      console.warn('Push subscription stored locally:', subscription.toJSON());
    }
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
    }
  }

  /**
   * Handle notification click events
   */
  private handleNotificationClick(data: Record<string, unknown>): void {
    const { notificationType, url } = data;

    switch (notificationType) {
      case 'workout-reminder':
        // Navigate to counter page
        window.location.href = '/';
        break;
      case 'goal-reminder':
        // Navigate to stats page
        window.location.href = '/?tab=stats';
        break;
      case 'achievement':
        // Show achievement modal or navigate to stats
        this.showAchievementDetails(data);
        break;
      default:
        if (url) {
          window.location.href = url as string;
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
        window.location.href = '/';
        break;
      case 'view-stats':
        window.location.href = '/?tab=stats';
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
   * Show achievement details (could be a modal or page navigation)
   */
  private showAchievementDetails(data: Record<string, unknown>): void {
    // Implementation depends on your app's routing/modal system
    if (process.env.NODE_ENV === 'development') {
      console.warn('Achievement unlocked:', data);
    }
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
    this.scheduledNotifications.set(notification.id, notification);

    const delay = notification.scheduledTime.getTime() - Date.now();

    if (delay > 0) {
      // For immediate scheduling (within the session)
      setTimeout(() => {
        this.showLocalNotification(notification.template);
      }, delay);
    }

    // For persistent scheduling across sessions, you'd typically use:
    // 1. Web Background Sync API
    // 2. Server-side push notifications
    // 3. Service worker scheduling

    this.saveScheduledNotifications();
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
          actions: template.actions,
          ...template.data,
        },
        requireInteraction: template.requireInteraction,
        silent: template.silent,
        tag: template.id,
      } as NotificationOptions);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(newSettings: Partial<PushNotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.rescheduleNotifications();
  }

  /**
   * Get current notification settings
   */
  getSettings(): PushNotificationSettings {
    return { ...this.settings };
  }

  /**
   * Reschedule all notifications based on current settings
   */
  private rescheduleNotifications(): void {
    this.scheduledNotifications.clear();

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

    daysOfWeek.forEach((dayOfWeek) => {
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
        daysToSchedule = [1]; // Mondays
        break;
      case 'custom':
        daysToSchedule = customDays || [];
        break;
    }

    if (time) {
      const [hours, minutes] = time.split(':').map(Number);

      daysToSchedule.forEach((dayOfWeek) => {
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
  private loadSettings(): PushNotificationSettings {
    const stored = localStorage.getItem('push-notification-settings');
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
    localStorage.setItem('push-notification-settings', JSON.stringify(this.settings));
  }

  /**
   * Save scheduled notifications to localStorage
   */
  private saveScheduledNotifications(): void {
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
   * Load scheduled notifications from localStorage
   */
  private loadScheduledNotifications(): void {
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
   * Clear all scheduled notifications
   */
  clearAllNotifications(): void {
    this.scheduledNotifications.clear();
    localStorage.removeItem('scheduled-notifications');
  }

  /**
   * Get subscription status
   */
  isSubscribed(): boolean {
    return !!this.subscription;
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        localStorage.removeItem('push-subscription');
        this.clearAllNotifications();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }
}

// Export singleton instance
export const enhancedPushService = EnhancedPushService.getInstance();

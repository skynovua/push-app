# 🔔 Local Notifications System

## Огляд

Нова система локальних нотифікацій для Push-Up Counter App забезпечує надійну доставку повідомлень навіть коли PWA додаток закритий. Система замінює попередню реалізацію на базі server push notifications на чисто локальний підхід.

## ✨ Основні переваги

- **🎯 Повна автономність** - Нотифікації працюють без серверної частини
- **🔋 Фонова робота** - Service Worker забезпечує роботу при закритому додатку
- **💾 Персистентність** - IndexedDB + localStorage для надійного збереження
- **⚡ Швидкість** - Моментальна реакція без мережевих запитів
- **🔧 Простота** - Легке налаштування без VAPID ключів

## 🏗️ Архітектура

```
┌─────────────────────────────────────────┐
│           Main Thread (App)             │
├─────────────────────────────────────────┤
│  LocalNotificationService (Singleton)  │
│  ├── Settings Management                │
│  ├── Notification Scheduling           │
│  ├── IndexedDB Storage                  │
│  └── Service Worker Communication      │
└─────────────────────────────────────────┘
                    ↕️
┌─────────────────────────────────────────┐
│           Service Worker                │
├─────────────────────────────────────────┤
│  ├── Background Notification Timers    │
│  ├── Persistent Schedule Storage       │
│  ├── Notification Display              │
│  └── User Interaction Handling         │
└─────────────────────────────────────────┘
```

## 📱 Типи нотифікацій

### 1. 💪 Workout Reminders

- Налаштовуваний час (HH:MM)
- Вибір днів тижня (Пн-Нд)
- Персональні повідомлення
- Дії: Почати, Snooze, Закрити

### 2. 🎯 Goal Reminders

- Нагадування за X годин до кінця дня
- Щоденна періодичність
- Дії: Статистика, Тренування

### 3. 🏆 Achievement Notifications

- Етапи (10, 50, 100+ віджимань)
- Серії (streak tracking)
- Персональні рекорди
- Дії: Переглянути, Супер!

### 4. ⚡ Motivational Messages

- Частота: Щодня/Щотижня/Власний графік
- Налаштовуваний час
- Ротація мотиваційних цитат
- Без дій (тільки показ)

## 🔧 API Reference

### LocalNotificationService

```typescript
// Singleton instance
const localNotificationService = LocalNotificationService.getInstance();

// Request permission
await localNotificationService.requestPermission(): Promise<boolean>

// Check support
localNotificationService.isNotificationSupported(): boolean

// Update settings
localNotificationService.updateSettings(settings: Partial<LocalNotificationSettings>): void

// Schedule notification
await localNotificationService.scheduleNotification(notification: ScheduledNotification): Promise<void>

// Send test notification
await localNotificationService.sendTestNotification(): Promise<void>

// Send achievement notification
await localNotificationService.sendAchievementNotification(achievement): Promise<void>

// Clear all notifications
await localNotificationService.clearAllNotifications(): Promise<void>

// Get current settings
localNotificationService.getSettings(): LocalNotificationSettings

// Get permission status
localNotificationService.getPermissionStatus(): NotificationPermission
```

### Settings Interface

```typescript
interface LocalNotificationSettings {
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
```

## 🚀 Використання

### Базове налаштування

```typescript
import { localNotificationService } from '@/shared/lib/local-notification-service';

// Request permission
const hasPermission = await localNotificationService.requestPermission();

if (hasPermission) {
  // Enable basic workout reminders
  localNotificationService.updateSettings({
    enabled: true,
    workoutReminders: {
      enabled: true,
      time: '18:00',
      daysOfWeek: [0, 1, 2, 3, 4], // Monday to Friday
    },
  });
}
```

### Відправка achievement нотифікації

```typescript
// When user completes a milestone
await localNotificationService.sendAchievementNotification({
  title: 'Новий рекорд!',
  description: 'Ви досягли 100 віджимань за день! 🎉',
  type: 'milestone',
  milestone: 100,
});
```

### Тестування

```typescript
// Send test notification
await localNotificationService.sendTestNotification();
```

## 💾 Збереження даних

### IndexedDB (primary)

- **База**: `PushUpCounterNotifications`
- **Store**: `notifications`
- **Структура**: `{ id: 'scheduled', data: ScheduledNotification[] }`

### localStorage (fallback)

- **Settings**: `local-notification-settings`
- **Schedule**: `scheduled-notifications`

## 🔄 Service Worker Integration

### Синхронізація з SW

```typescript
// Send schedule to service worker
this.registration.active?.postMessage({
  type: 'SYNC_NOTIFICATIONS',
  data: {
    notifications: serializedNotifications,
    settings: this.settings,
  },
});
```

### Обробка подій з SW

```typescript
navigator.serviceWorker.addEventListener('message', (event) => {
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
});
```

## 🎨 UI Components

### PushNotificationSettingsPanel

```typescript
import { PushNotificationSettingsPanel } from '@/features/pwa/ui/push-notification-settings';

<PushNotificationSettingsPanel
  onSettingsChange={(settings) => {
    console.log('Settings updated:', settings);
  }}
/>
```

## 🔍 Debugging

### Console Logs

- `[SW] Installing service worker v4 with local notifications`
- `[SW] Scheduling notifications`
- `[SW] Scheduled notification: workout-reminder-1 in 28800000 ms`
- `[SW] Showing scheduled notification: workout-reminder-1`

### Chrome DevTools

1. **Application** → **Service Workers** → Перевірити статус SW
2. **Application** → **Storage** → **IndexedDB** → `PushUpCounterNotifications`
3. **Console** → Фільтр `[SW]` для Service Worker логів

### Testing

```typescript
// Manual testing in console
const service = localNotificationService;

// Check permission
service.getPermissionStatus(); // 'granted' | 'denied' | 'default'

// Test notification
await service.sendTestNotification();

// Check settings
service.getSettings();

// Clear all
await service.clearAllNotifications();
```

## 🌐 Browser Support

| Feature           | Chrome | Firefox | Safari | Edge |
| ----------------- | ------ | ------- | ------ | ---- |
| Service Worker    | ✅     | ✅      | ✅     | ✅   |
| Notifications API | ✅     | ✅      | ✅     | ✅   |
| IndexedDB         | ✅     | ✅      | ✅     | ✅   |
| PWA Install       | ✅     | ✅      | ✅     | ✅   |

### iOS Safari особливості

- Нотифікації працюють тільки в Safari
- Потрібно Add to Home Screen для повної функціональності
- Service Worker має обмеження в background режимі

## 🚨 Troubleshooting

### Нотифікації не показуються

1. **Перевірити permission**: `Notification.permission === 'granted'`
2. **Перевірити Service Worker**: `navigator.serviceWorker.controller`
3. **Перевірити налаштування**: `service.getSettings().enabled === true`
4. **Перевірити IndexedDB**: DevTools → Application → IndexedDB

### Service Worker не активується

1. **Hard refresh**: Ctrl+Shift+R / Cmd+Shift+R
2. **Unregister SW**: DevTools → Application → Service Workers → Unregister
3. **Clear cache**: DevTools → Application → Clear storage

### Performance issues

1. **Перевірити кількість таймерів**: `activeTimers.size` в SW
2. **Очистити старі нотифікації**: `clearAllNotifications()`
3. **Перевірити IndexedDB розмір**: DevTools → Application → Storage

## 📈 Metrics & Analytics

### Key Performance Indicators

- **Permission Grant Rate**: % користувачів що дозволили нотифікації
- **Notification Click Rate**: % натискань на нотифікації
- **Settings Engagement**: Найпопулярніші типи нотифікацій
- **Retention Impact**: Вплив на повернення користувачів

### Implementation

```typescript
// Track permission requests
analytics.track('notification_permission_requested');

// Track permission grants
if (permission === 'granted') {
  analytics.track('notification_permission_granted');
}

// Track notification clicks
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'NOTIFICATION_CLICKED') {
    analytics.track('notification_clicked', {
      type: event.data.notificationType,
    });
  }
});
```

## 🔮 Roadmap

### v1.1 - Enhanced Scheduling

- [ ] Smart timing based on user activity
- [ ] Timezone support
- [ ] Snooze customization (5, 15, 30 min)

### v1.2 - Advanced Features

- [ ] Conditional notifications (weather, calendar)
- [ ] Rich media notifications (images, progress bars)
- [ ] Notification categories and grouping

### v1.3 - AI Integration

- [ ] ML-based optimal notification timing
- [ ] Personalized motivation messages
- [ ] Adaptive frequency based on engagement

---

**Розроблено для Push-Up Counter App** 💪  
**Дата оновлення**: June 2025

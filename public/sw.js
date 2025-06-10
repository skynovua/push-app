// Enhanced service worker for PWA functionality with local notifications
const CACHE_NAME = 'pushup-counter-v4';
const STATIC_CACHE = 'pushup-static-v4';
const RUNTIME_CACHE = 'pushup-runtime-v4';

// Essential files to cache for offline functionality
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/icon.svg',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png'
];

// Local notification storage
let notificationSchedule = [];
let notificationSettings = {};
let activeTimers = new Map();

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v4 with local notifications');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Service worker installed');
        // Take control immediately for new features
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and setup notifications
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v4');
  const cacheWhitelist = [STATIC_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
      // Initialize notification system
      initializeNotificationSystem()
    ])
  );
});

// Fetch event - implement cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Clone the request for network fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseToCache = response.clone();

            // Determine which cache to use
            const cacheToUse = isStaticAsset(event.request.url) ? STATIC_CACHE : RUNTIME_CACHE;

            caches.open(cacheToUse)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Fallback for offline scenarios
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }

            // Return a basic offline response for other requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Helper function to determine if asset should be cached long-term
function isStaticAsset(url) {
  return url.includes('/assets/') ||
    url.includes('.png') ||
    url.includes('.jpg') ||
    url.includes('.svg') ||
    url.includes('.ico') ||
    url.includes('.css') ||
    url.includes('.js');
}

// Initialize notification scheduling system
async function initializeNotificationSystem() {
  try {
    console.log('[SW] Initializing notification system');

    // Load notification data from IndexedDB
    const db = await openNotificationDB();
    const transaction = db.transaction(['schedule'], 'readonly');
    const store = transaction.objectStore('schedule');
    const request = store.get('current');

    request.onsuccess = () => {
      if (request.result) {
        notificationSchedule = request.result.notifications || [];
        notificationSettings = request.result.settings || {};
        console.log('[SW] Loaded notification schedule:', notificationSchedule.length, 'notifications');
        scheduleAllNotifications();
      }
    };
  } catch (error) {
    console.error('[SW] Error initializing notifications:', error);
  }
}

// Schedule all notifications based on current time
function scheduleAllNotifications() {
  console.log('[SW] Scheduling notifications');

  // Clear existing timers
  activeTimers.forEach(timerId => clearTimeout(timerId));
  activeTimers.clear();

  const now = Date.now();

  notificationSchedule.forEach(notification => {
    const scheduledTime = new Date(notification.scheduledTime).getTime();
    const delay = scheduledTime - now;

    if (delay > 0) {
      const timerId = setTimeout(() => {
        showScheduledNotification(notification);
      }, delay);

      activeTimers.set(notification.id, timerId);
      console.log('[SW] Scheduled notification:', notification.id, 'in', delay, 'ms');
    } else if (notification.recurring) {
      // Reschedule recurring notifications that have passed
      const nextTime = calculateNextRecurrence(notification);
      if (nextTime) {
        notification.scheduledTime = nextTime.toISOString();
        const nextDelay = nextTime.getTime() - now;

        if (nextDelay > 0) {
          const timerId = setTimeout(() => {
            showScheduledNotification(notification);
          }, nextDelay);

          activeTimers.set(notification.id, timerId);
          console.log('[SW] Rescheduled recurring notification:', notification.id, 'in', nextDelay, 'ms');
        }
      }
    }
  });
}

// Calculate next recurrence for recurring notifications
function calculateNextRecurrence(notification) {
  if (!notification.recurring) return null;

  const currentTime = new Date(notification.scheduledTime);

  switch (notification.recurring.type) {
    case 'daily':
      return new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(currentTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const nextMonth = new Date(currentTime);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth;
    default:
      return null;
  }
}

// Show a scheduled notification
async function showScheduledNotification(notification) {
  try {
    console.log('[SW] Showing scheduled notification:', notification.id);

    const { template } = notification;

    await self.registration.showNotification(template.title, {
      body: template.body,
      icon: template.icon || '/icon-192x192.png',
      badge: template.badge || '/icon-192x192.png',
      data: {
        notificationType: template.type,
        notificationId: template.id,
        ...template.data,
      },
      actions: template.actions?.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon,
      })),
      requireInteraction: template.requireInteraction || false,
      silent: template.silent || false,
      tag: template.id,
    });

    // Remove timer
    activeTimers.delete(notification.id);

    // Send message to clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'NOTIFICATION_SHOWN',
        data: { notificationId: notification.id }
      });
    });

    // If recurring, schedule next occurrence
    if (notification.recurring) {
      const nextTime = calculateNextRecurrence(notification);
      if (nextTime) {
        notification.scheduledTime = nextTime.toISOString();
        await saveNotificationSchedule();

        const delay = nextTime.getTime() - Date.now();
        if (delay > 0) {
          const timerId = setTimeout(() => {
            showScheduledNotification(notification);
          }, delay);

          activeTimers.set(notification.id, timerId);
          console.log('[SW] Scheduled next recurrence for:', notification.id, 'in', delay, 'ms');
        }
      }
    }

  } catch (error) {
    console.error('[SW] Error showing notification:', error);
  }
}

// Save notification schedule to IndexedDB
async function saveNotificationSchedule() {
  try {
    const db = await openNotificationDB();
    const transaction = db.transaction(['schedule'], 'readwrite');
    const store = transaction.objectStore('schedule');

    await store.put({
      id: 'current',
      notifications: notificationSchedule,
      settings: notificationSettings,
      lastUpdate: Date.now()
    });
  } catch (error) {
    console.error('[SW] Error saving notification schedule:', error);
  }
}

// Open IndexedDB for notifications
function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PushUpCounterNotifications', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('schedule')) {
        const store = db.createObjectStore('schedule', { keyPath: 'id' });
        store.createIndex('lastUpdate', 'lastUpdate', { unique: false });
      }
    };
  });
}

// Handle messages from client
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);

  const { type, data } = event.data || {};

  switch (type) {
    case 'SYNC_NOTIFICATIONS':
      handleNotificationSync(data);
      break;
    case 'SKIP_WAITING':
      console.log('[SW] Skipping waiting and activating new service worker');
      self.skipWaiting();
      break;
    case 'CHECK_FOR_UPDATE':
      // Force a check for updates
      fetch('/sw.js', { cache: 'no-cache' })
        .then(() => console.log('[SW] Update check completed'))
        .catch(error => console.error('[SW] Update check failed:', error));
      break;
  }
});

// Handle notification sync from client
async function handleNotificationSync(data) {
  try {
    console.log('[SW] Syncing notifications from client');

    notificationSchedule = data.notifications.map(notification => ({
      ...notification,
      scheduledTime: notification.scheduledTime,
    }));

    notificationSettings = data.settings;

    // Save to IndexedDB
    await saveNotificationSchedule();

    // Reschedule all notifications
    scheduleAllNotifications();

    console.log('[SW] Notification sync completed:', notificationSchedule.length, 'notifications');
  } catch (error) {
    console.error('[SW] Error syncing notifications:', error);
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag, 'Action:', event.action);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};
  const notificationType = data.notificationType;

  // Send message to clients about notification interaction
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Notify all clients about the notification click
      clientList.forEach(client => {
        client.postMessage({
          type: action ? 'NOTIFICATION_ACTION' : 'NOTIFICATION_CLICKED',
          data: {
            action,
            notificationType,
            notificationId: event.notification.tag,
            ...data
          }
        });
      });

      // Handle different actions
      switch (action) {
        case 'start-workout':
          return openAppPage('/');
        case 'view-stats':
          return openAppPage('/?tab=stats');
        case 'snooze':
          // Snoozing is handled by the client
          return Promise.resolve();
        case 'dismiss':
          // Just close, no action needed
          return Promise.resolve();
        default:
          // Default click action based on notification type
          switch (notificationType) {
            case 'workout-reminder':
              return openAppPage('/');
            case 'goal-reminder':
              return openAppPage('/?tab=stats');
            case 'achievement':
              return openAppPage('/?tab=stats');
            case 'motivational':
              return openAppPage('/');
            default:
              return openAppPage(data.url || '/');
          }
      }
    })
  );
});

// Helper function to open app page
function openAppPage(url) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    // Check if the app is already open
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.focus();
        if (url !== '/') {
          client.navigate(url);
        }
        return;
      }
    }

    // If no existing client, open a new window
    if (self.clients.openWindow) {
      return self.clients.openWindow(url);
    }
  });
}

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);

  const data = event.notification.data || {};

  // Send message to clients about notification dismissal
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      clientList.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_DISMISSED',
          data: {
            notificationId: event.notification.tag,
            notificationType: data.notificationType,
            timestamp: Date.now()
          }
        });
      });
    })
  );
});

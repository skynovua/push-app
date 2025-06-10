// Enhanced service worker for PWA functionality with iOS optimizations
const CACHE_NAME = 'pushup-counter-v3';
const STATIC_CACHE = 'pushup-static-v3';
const RUNTIME_CACHE = 'pushup-runtime-v3';

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

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v3');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Don't force activation immediately - wait for user confirmation
        console.log('[SW] Service worker installed, waiting for activation');
        // Send message to client about update availability
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATE_AVAILABLE'
            });
          });
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v3');
  const cacheWhitelist = [STATIC_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        console.log('[SW] Service worker activated and taking control');
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients that update is complete
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATE_COMPLETE'
          });
        });
      })
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

// Handle messages from client (including update requests)
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skipping waiting and activating new service worker');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
    // Force a check for updates by attempting to fetch the SW file
    fetch('/sw.js', { cache: 'no-cache' })
      .then(() => {
        console.log('[SW] Update check completed');
      })
      .catch(error => {
        console.error('[SW] Update check failed:', error);
      });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag, 'Action:', event.action);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  const notificationType = data.notificationType;
  
  // Send message to clients about notification interaction
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
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
  
  // Helper function to open app page
  function openAppPage(url) {
    return clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
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
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    });
  }
});

// Handle push events (for server-sent push notifications)
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');
  
  let notificationData = {
    title: '💪 Push-Up Counter',
    body: 'Ви отримали нове повідомлення!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {}
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }
  
  event.waitUntil(
    (async () => {
      try {
        // Try to show notification immediately
        await self.registration.showNotification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          badge: notificationData.badge,
          data: notificationData.data,
          actions: notificationData.actions,
          requireInteraction: notificationData.requireInteraction,
          silent: notificationData.silent,
          tag: notificationData.tag || 'push-notification',
          timestamp: Date.now()
        });
        
        // Log successful notification delivery
        console.log('[SW] Push notification delivered successfully');
        
      } catch (error) {
        console.error('[SW] Error showing push notification:', error);
        
        // If showing notification fails, queue it for later
        await queueNotificationForLater(notificationData);
        
        // Register background sync to retry later
        try {
          await self.registration.sync.register('send-notification');
        } catch (syncError) {
          console.error('[SW] Error registering background sync:', syncError);
        }
      }
    })()
  );
});

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // Track notification dismissal for analytics
  const data = event.notification.data || {};
  
  // Send message to clients about notification dismissal
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
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

// Background sync for offline notifications
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'send-notification') {
    event.waitUntil(sendQueuedNotifications());
  }
});

async function sendQueuedNotifications() {
  try {
    // Get queued notifications from IndexedDB or local storage
    const notifications = await getQueuedNotifications();
    
    for (const notification of notifications) {
      await self.registration.showNotification(notification.title, notification.options);
    }
    
    // Clear queued notifications after sending
    await clearQueuedNotifications();
  } catch (error) {
    console.error('[SW] Error sending queued notifications:', error);
  }
}

async function getQueuedNotifications() {
  try {
    // Open IndexedDB for persistent notification storage
    const db = await openNotificationDB();
    const transaction = db.transaction(['notifications'], 'readonly');
    const store = transaction.objectStore('notifications');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Error getting queued notifications:', error);
    return [];
  }
}

async function clearQueuedNotifications() {
  try {
    // Clear sent notifications from IndexedDB
    const db = await openNotificationDB();
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Error clearing queued notifications:', error);
  }
}

async function openNotificationDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NotificationQueue', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        const store = db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

async function queueNotificationForLater(notificationData) {
  try {
    const db = await openNotificationDB();
    const transaction = db.transaction(['notifications'], 'readwrite');
    const store = transaction.objectStore('notifications');
    
    const notification = {
      ...notificationData,
      timestamp: Date.now(),
      queued: true
    };
    
    const request = store.add(notification);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[SW] Error queueing notification:', error);
  }
}
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  
  // You can track notification dismissals here
  // For example, send analytics data
});

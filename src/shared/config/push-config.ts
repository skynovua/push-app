// Push notification configuration for production and development

export interface PushConfig {
  vapidPublicKey: string;
  vapidPrivateKey?: string; // Only for server-side
  pushEndpoint?: string; // Your push server endpoint
}

/**
 * VAPID keys for push notifications
 *
 * To generate new VAPID keys, use:
 * npx web-push generate-vapid-keys
 *
 * Or online generator:
 * https://vapidkeys.com/
 */
export const pushConfig: PushConfig = {
  // Development VAPID public key (replace with your own)
  vapidPublicKey:
    process.env.VITE_VAPID_PUBLIC_KEY ||
    'BEl62iUYgUivxIkv69yViEuiBIa40HI80NwQRAQY5zMOJ2UUczF-UtVlQGgbgQ',

  // Server endpoint for sending push notifications
  pushEndpoint: process.env.VITE_PUSH_ENDPOINT || 'http://localhost:3001/send-push',
};

/**
 * Check if push notifications are supported
 */
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

/**
 * Check if we're in production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get appropriate VAPID key for current environment
 */
export const getVAPIDPublicKey = (): string => {
  if (isProduction()) {
    // In production, ensure VAPID key is set
    if (!process.env.VITE_VAPID_PUBLIC_KEY) {
      console.warn('VITE_VAPID_PUBLIC_KEY not set in production environment');
    }
  }

  return pushConfig.vapidPublicKey;
};

/**
 * Validate VAPID key format
 */
export const isValidVAPIDKey = (key: string): boolean => {
  // VAPID keys should be base64 URL-safe strings of specific length
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  return key.length >= 65 && base64UrlPattern.test(key);
};

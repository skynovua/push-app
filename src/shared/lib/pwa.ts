// PWA installation and notification utilities

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

class PWAService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
    });

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
    });

    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as unknown as { standalone?: boolean }).standalone === true) {
      this.isInstalled = true;
    }
  }

  canInstall(): boolean {
    // For iOS Safari, check if not already in standalone mode
    if (this.isIOSSafari()) {
      return !this.isInstalled;
    }
    
    return !!this.deferredPrompt && !this.isInstalled;
  }

  private isIOSSafari(): boolean {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);
    return isIOS && isSafari;
  }

  async install(): Promise<boolean> {
    // For iOS Safari, show installation instructions
    if (this.isIOSSafari()) {
      this.showIOSInstallInstructions();
      return false; // Can't programmatically install on iOS
    }

    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during PWA installation:', error);
      return false;
    }
  }

  private showIOSInstallInstructions(): void {
    const message = `Щоб встановити додаток на iOS:
1. Натисніть кнопку "Поделиться" внизу екрану
2. Прокрутіть вниз і виберіть "На екран Домой"
3. Натисніть "Добавить"`;
    
    alert(message);
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Show notification
  showNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    }
  }

  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Register service worker
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }
}

export const pwaService = new PWAService();

// Auto-register service worker when module loads
if (typeof window !== 'undefined') {
  pwaService.registerServiceWorker();
}

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
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailableCallback: (() => void) | null = null;
  private updateInstalledCallback: (() => void) | null = null;

  // Mobile-specific functionality
  private touchStartY = 0;
  private touchEndY = 0;
  private isPullToRefreshEnabled = false;
  private pullToRefreshElement: HTMLElement | null = null;

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

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent) {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'UPDATE_AVAILABLE':
          console.log('Update available');
          if (this.updateAvailableCallback) {
            this.updateAvailableCallback();
          }
          break;
        case 'UPDATE_INSTALLED':
          console.log('Update installed');
          if (this.updateInstalledCallback) {
            this.updateInstalledCallback();
          }
          break;
      }
    }
  }

  // Set callbacks for update events
  onUpdateAvailable(callback: () => void) {
    this.updateAvailableCallback = callback;
  }

  onUpdateInstalled(callback: () => void) {
    this.updateInstalledCallback = callback;
  }

  // Apply pending updates
  async applyUpdate(): Promise<void> {
    if (this.registration && this.registration.waiting) {
      // Send message to waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for service worker to become active
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve();
        }, { once: true });
      });
    }
  }

  // Check for updates manually
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  // Register service worker
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        
        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (this.updateAvailableCallback) {
                  this.updateAvailableCallback();
                }
              }
            });
          }
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
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

  /**
   * Check if the device is iOS (iPhone, iPad, iPod)
   */
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
  }

  /**
   * Check if the app is running in standalone mode (installed PWA)
   */
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  }

  /**
   * Check if the device is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get iOS device information
   */
  getIOSDeviceInfo(): { model: string; version: string } | null {
    if (!this.isIOS()) {
      return null;
    }

    const userAgent = window.navigator.userAgent;
    
    // Extract iOS version
    const versionMatch = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const version = versionMatch 
      ? `${versionMatch[1]}.${versionMatch[2]}${versionMatch[3] ? '.' + versionMatch[3] : ''}`
      : 'Unknown';

    // Determine device model
    let model = 'iOS Device';
    if (/iPad/.test(userAgent)) {
      model = 'iPad';
    } else if (/iPhone/.test(userAgent)) {
      model = 'iPhone';
    } else if (/iPod/.test(userAgent)) {
      model = 'iPod Touch';
    }

    return { model, version };
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
    const message = `📱 Встановлення додатку на iOS:

1. Натисніть кнопку "Поділитися" (📤) внизу Safari
2. Прокрутіть вниз і оберіть "На екран «Домой»" 
3. Натисніть "Додати"

Після встановлення:
• Додаток працюватиме як нативний застосунок
• Буде доступний offline
• Отримаєте повноекранний досвід без Safari UI
• Швидше завантаження та кращу продуктивність`;
    
    // Create a more user-friendly modal instead of alert
    this.createIOSInstallModal(message);
  }

  private createIOSInstallModal(message: string): void {
    // Check if modal already exists
    if (document.getElementById('ios-install-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'ios-install-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
      box-sizing: border-box;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      max-width: 90%;
      max-height: 80%;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const text = document.createElement('div');
    text.style.cssText = `
      white-space: pre-line;
      line-height: 1.5;
      color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    text.textContent = message;

    closeBtn.onclick = () => modal.remove();
    modal.onclick = (e) => e.target === modal && modal.remove();

    content.appendChild(closeBtn);
    content.appendChild(text);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Enable pull-to-refresh for mobile devices
  enablePullToRefresh(element?: HTMLElement) {
    if (!this.isMobileDevice()) return;

    this.isPullToRefreshEnabled = true;
    this.pullToRefreshElement = element || document.body;

    this.pullToRefreshElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.pullToRefreshElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.pullToRefreshElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  private handleTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  private handleTouchMove(event: TouchEvent) {
    this.touchEndY = event.touches[0].clientY;
    
    // Check if user is at the top of the page and pulling down
    if (window.scrollY === 0 && this.touchEndY > this.touchStartY + 100) {
      // Show pull-to-refresh indicator
      this.showPullToRefreshIndicator();
    }
  }

  private handleTouchEnd() {
    if (!this.isPullToRefreshEnabled) return;
    
    if (window.scrollY === 0 && this.touchEndY > this.touchStartY + 150) {
      // Trigger refresh
      this.checkForUpdates();
      this.hidePullToRefreshIndicator();
    }
  }

  private showPullToRefreshIndicator() {
    // Create or show pull-to-refresh indicator
    let indicator = document.getElementById('pull-to-refresh-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'pull-to-refresh-indicator';
      indicator.className = 'fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white text-center py-2 text-sm transition-transform duration-200 -translate-y-full';
      indicator.textContent = '⟳ Pull to refresh';
      document.body.appendChild(indicator);
    }
    indicator.style.transform = 'translateY(0)';
  }

  private hidePullToRefreshIndicator() {
    const indicator = document.getElementById('pull-to-refresh-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(-100%)';
      setTimeout(() => indicator.remove(), 200);
    }
  }

  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Show native-like update notification for mobile
  async showMobileUpdateNotification(title: string, body: string): Promise<boolean> {
    // Try to use native notifications first
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'app-update',
          requireInteraction: true
        });

        notification.onclick = () => {
          this.applyUpdate();
          notification.close();
        };

        return true;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }

    // Fallback to in-app notification
    return false;
  }

  // Request notification permission for mobile updates
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

  // Show notification (fallback for older browsers)
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...options
        });
      } else {
        // Fallback to console or in-app notification
        console.log(`Notification: ${title}`, options?.body);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
}

export const pwaService = new PWAService();

// Auto-register service worker when module loads
if (typeof window !== 'undefined') {
  pwaService.registerServiceWorker();
}

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

  // Check if running on iOS
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // Check if running in standalone mode (PWA installed)
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  }

  // Get device info for iOS
  getIOSDeviceInfo(): { model: string; version: string } | null {
    if (!this.isIOS()) return null;

    const userAgent = navigator.userAgent;
    let model = 'Unknown iOS Device';
    
    if (/iPhone/.test(userAgent)) {
      model = 'iPhone';
    } else if (/iPad/.test(userAgent)) {
      model = 'iPad';
    } else if (/iPod/.test(userAgent)) {
      model = 'iPod';
    }

    // Extract iOS version
    const versionMatch = userAgent.match(/OS (\d+)_(\d+)/);
    const version = versionMatch ? `${versionMatch[1]}.${versionMatch[2]}` : 'Unknown';

    return { model, version };
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

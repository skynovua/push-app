import { useEffect, useState } from 'react';
import { Activity, BarChart3, Settings } from 'lucide-react';

import { UpdateNotification } from '@/features/pwa/ui/update-notification';
import { initializeDefaults, pwaService, useT } from '@/shared/lib';
import { useWorkoutStore } from '@/shared/model';
// Shared
import { Button } from '@/shared/ui/button';
import { ToastProvider } from '@/shared/ui/toast-provider';
// Features
import { CounterFeature, SettingsFeature, StatsFeature } from '@/features';

type Tab = 'counter' | 'stats' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    // Відновлюємо активну вкладку з sessionStorage (тимчасово для сесії браузера)
    try {
      const savedTab = sessionStorage.getItem('activeTab') as Tab;
      return savedTab && ['counter', 'stats', 'settings'].includes(savedTab) ? savedTab : 'counter';
    } catch (error) {
      console.warn('Failed to load activeTab from sessionStorage:', error);
      return 'counter';
    }
  });
  const { loadSettings, loadTodayStats } = useWorkoutStore();
  const t = useT();

  useEffect(() => {
    // Initialize database and load settings
    const initialize = async () => {
      await initializeDefaults();
      await loadSettings();
      await loadTodayStats(); // Load today's push-ups count
      // Register service worker for PWA functionality
      await pwaService.registerServiceWorker();
    };

    initialize();
  }, [loadSettings, loadTodayStats]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    try {
      sessionStorage.setItem('activeTab', tabId);
    } catch (error) {
      console.warn('Failed to save activeTab to sessionStorage:', error);
    }
  };

  const tabs = [
    { id: 'counter' as Tab, label: t.counter.title, icon: Activity },
    { id: 'stats' as Tab, label: t.common.stats, icon: BarChart3 },
    { id: 'settings' as Tab, label: t.common.settings, icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'counter':
        return <CounterFeature />;
      case 'stats':
        return <StatsFeature />;
      case 'settings':
        return <SettingsFeature />;
      default:
        return <CounterFeature />;
    }
  };

  return (
    <ToastProvider>
      <UpdateNotification />
      <div className="bg-background min-h-screen">
        {/* Header */}
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 z-50 border-b backdrop-blur">
          <div className="container mx-auto max-w-3xl px-4 py-4">
            <div className="flex items-center justify-center">
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Activity className="text-primary h-8 w-8" />
                Push-Up Counter
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto max-w-3xl px-6 pb-20">{renderContent()}</main>

        {/* Bottom Navigation */}
        <nav
          className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed bottom-0 left-0 right-0 border-t backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="container mx-auto max-w-3xl px-4">
            <div className="flex justify-around py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <Button
                    key={tab.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex h-auto flex-col items-center gap-1 px-3 py-2 ${
                      isActive ? '' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{tab.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </ToastProvider>
  );
}

export default App;

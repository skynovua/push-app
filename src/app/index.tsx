import { useState, useEffect } from 'react';
import { Activity, BarChart3, Settings } from 'lucide-react';

// Features
import { CounterFeature, StatsFeature, SettingsFeature } from '@/features';

// Shared
import { Button } from '@/shared/ui/button';
import { ToastProvider } from '@/shared/ui/toast-provider';
import { useWorkoutStore } from '@/shared/model';
import { useT, initializeDefaults } from '@/shared/lib';

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
  const { loadSettings } = useWorkoutStore();
  const t = useT();

  useEffect(() => {
    // Initialize database and load settings
    const initialize = async () => {
      await initializeDefaults();
      await loadSettings();
    };
    
    initialize();
  }, [loadSettings]);

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
      <div 
        className="min-h-screen bg-background"
        style={{ 
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)'
        }}
      >
      {/* Header */}
      <header 
        className="z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
      >
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary" />
              Push-Up Counter
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="container max-w-2xl mx-auto pb-20 px-6"
      >
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="container max-w-2xl mx-auto px-4">
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
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
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

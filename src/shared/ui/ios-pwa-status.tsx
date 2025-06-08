import React, { useEffect, useState } from 'react';
import { pwaService } from '@/shared/lib/pwa';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

interface IOSPWAStatusProps {
  onInstallClick?: () => void;
}

export const IOSPWAStatus: React.FC<IOSPWAStatusProps> = ({ onInstallClick }) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ model: string; version: string } | null>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const checkPWAStatus = () => {
      setIsIOS(pwaService.isIOS());
      setIsStandalone(pwaService.isStandalone());
      setDeviceInfo(pwaService.getIOSDeviceInfo());
      setCanInstall(pwaService.canInstall());
    };

    checkPWAStatus();

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isIOS) {
    return null; // Only show on iOS devices
  }

  const handleInstall = async () => {
    if (onInstallClick) {
      onInstallClick();
    } else {
      await pwaService.install();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📱 iOS PWA Status
          <Badge variant={isStandalone ? "default" : "secondary"}>
            {isStandalone ? "Встановлено" : "Веб-версія"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deviceInfo && (
          <div className="text-sm text-gray-600">
            <p><strong>Пристрій:</strong> {deviceInfo.model}</p>
            <p><strong>iOS версія:</strong> {deviceInfo.version}</p>
          </div>
        )}
        
        {isStandalone ? (
          <div className="p-3 bg-green-100 rounded-lg">
            <p className="text-green-800 text-sm">
              ✅ Додаток встановлений як PWA! Ви отримуєте:
            </p>
            <ul className="text-green-700 text-sm mt-2 list-disc list-inside">
              <li>Повноекранний досвід</li>
              <li>Швидше завантаження</li>
              <li>Робота в offline режимі</li>
              <li>Нативний вигляд та відчуття</li>
            </ul>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <p className="text-amber-800 text-sm">
                ⚠️ Для кращого досвіду встановіть додаток на домашній екран
              </p>
            </div>
            
            {canInstall && (
              <Button 
                onClick={handleInstall}
                className="w-full"
                variant="default"
              >
                📲 Показати інструкції з встановлення
              </Button>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Мережа:</strong> {pwaService.isOnline() ? "🟢 Online" : "🔴 Offline"}</p>
          <p><strong>Service Worker:</strong> {navigator.serviceWorker ? "🟢 Підтримується" : "🔴 Не підтримується"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

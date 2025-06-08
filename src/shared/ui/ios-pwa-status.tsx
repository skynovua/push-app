import React, { useEffect, useState } from 'react';
import { Smartphone, Download, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

// Shared imports
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { pwaService, useT } from '@/shared/lib';

/**
 * Props for IOSPWAStatus component
 */
interface IOSPWAStatusProps {
  onInstallClick?: () => void;
}

/**
 * IOSPWAStatus Component
 * 
 * Displays PWA installation status and controls specifically for iOS devices.
 * Shows device information, installation status, and provides installation guidance.
 * Only renders on iOS devices, returns null otherwise.
 */
export const IOSPWAStatus: React.FC<IOSPWAStatusProps> = ({ onInstallClick }) => {
  // === State ===
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ model: string; version: string } | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  
  const t = useT();

  // === Effects ===
  
  useEffect(() => {
    /**
     * Check PWA installation status and device capabilities
     */
    const checkPWAStatus = () => {
      try {
        setIsIOS(pwaService.isIOS ? pwaService.isIOS() : false);
        setIsStandalone(pwaService.isStandalone ? pwaService.isStandalone() : false);
        setDeviceInfo(pwaService.getIOSDeviceInfo ? pwaService.getIOSDeviceInfo() : null);
        setCanInstall(pwaService.canInstall ? pwaService.canInstall() : false);
      } catch (error) {
        console.warn('PWA service methods not available:', error);
        // Fallback detection
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
        setDeviceInfo(null);
        setCanInstall(false);
      }
    };

    checkPWAStatus();

    // Listen for app installation event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // === Early Return ===
  
  // Only show component on iOS devices
  if (!isIOS) {
    return null;
  }

  // === Event Handlers ===
  
  /**
   * Handle PWA installation attempt
   */
  const handleInstall = async () => {
    if (onInstallClick) {
      onInstallClick();
    } else {
      await pwaService.install();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {t.settings.iosPwaStatus}
          <Badge variant={isStandalone ? "default" : "secondary"}>
            {isStandalone ? t.settings.appInstalled : t.settings.webVersion}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Device Information */}
        {deviceInfo && (
          <div className="text-sm text-muted-foreground">
            <p><strong>{t.settings.deviceLabel}:</strong> {deviceInfo.model}</p>
            <p><strong>{t.settings.iosVersionLabel}:</strong> {deviceInfo.version}</p>
          </div>
        )}
        
        {/* Installation Status */}
        {isStandalone ? (
          <Card>
            <CardContent>
              <p className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {t.settings.pwaInstalled}
              </p>
              <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
                <li>{t.settings.pwaFeatures.fullscreen}</li>
                <li>{t.settings.pwaFeatures.faster}</li>
                <li>{t.settings.pwaFeatures.offline}</li>
                <li>{t.settings.pwaFeatures.native}</li>
              </ul>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                {t.settings.installSuggestion}
              </p>
            </div>
            
            {canInstall && (
              <Button 
                onClick={handleInstall}
                className="w-full"
                variant="default"
              >
                <Download className="h-4 w-4 mr-2" />
                {t.settings.showInstallInstructions}
              </Button>
            )}
          </div>
        )}
        
        {/* System Status */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <strong>{t.settings.networkStatus}:</strong> 
            {(pwaService.isOnline ? pwaService.isOnline() : navigator.onLine) ? (
              <>
                <Wifi className="h-3 w-3 text-green-600" />
                {t.settings.online}
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-600" />
                {t.settings.offline}
              </>
            )}
          </p>
          <p className="flex items-center gap-2">
            <strong>{t.settings.serviceWorkerStatus}:</strong> 
            {navigator.serviceWorker ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-600" />
                {t.settings.supported}
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-red-600" />
                {t.settings.notSupported}
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

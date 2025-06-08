import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Download, Smartphone, Wifi, WifiOff } from 'lucide-react';

import { pwaService, useT } from '@/shared/lib';
// Shared imports
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5" />
          {t.settings.iosPwaStatus}
          <Badge variant={isStandalone ? 'default' : 'secondary'}>
            {isStandalone ? t.settings.appInstalled : t.settings.webVersion}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Device Information */}
        {deviceInfo && (
          <div className="text-muted-foreground text-sm">
            <p>
              <strong>{t.settings.deviceLabel}:</strong> {deviceInfo.model}
            </p>
            <p>
              <strong>{t.settings.iosVersionLabel}:</strong> {deviceInfo.version}
            </p>
          </div>
        )}

        {/* Installation Status */}
        {isStandalone ? (
          <Card>
            <CardContent>
              <p className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {t.settings.pwaInstalled}
              </p>
              <ul className="text-muted-foreground mt-2 list-inside list-disc text-sm">
                <li>{t.settings.pwaFeatures.fullscreen}</li>
                <li>{t.settings.pwaFeatures.faster}</li>
                <li>{t.settings.pwaFeatures.offline}</li>
                <li>{t.settings.pwaFeatures.native}</li>
              </ul>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="bg-accent rounded-lg p-3">
              <p className="text-accent-foreground flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                {t.settings.installSuggestion}
              </p>
            </div>

            {canInstall && (
              <Button onClick={handleInstall} className="w-full" variant="default">
                <Download className="mr-2 h-4 w-4" />
                {t.settings.showInstallInstructions}
              </Button>
            )}
          </div>
        )}

        {/* System Status */}
        <div className="text-muted-foreground space-y-1 text-xs">
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

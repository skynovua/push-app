import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';

import { pwaService } from '@/shared/lib/pwa';
import { useT } from '@/shared/lib/translation';

interface UpdateNotificationProps {
  onClose?: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const t = useT();

  useEffect(() => {
    // Check if mobile device
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );

    // Request notification permission on mobile
    if (isMobile) {
      pwaService.requestNotificationPermission();
    }

    // Listen for update availability
    pwaService.onUpdateAvailable(() => {
      setIsVisible(true);

      // Try to show native notification on mobile
      if (isMobile) {
        pwaService.showMobileUpdateNotification(
          t.updates.updateAvailable,
          t.updates.updateAvailableBody
        );
      }
    });

    // Listen for update installation
    pwaService.onUpdateInstalled(() => {
      setIsVisible(false);
      setIsUpdating(false);
      // Show success notification
      pwaService.showNotification(t.updates.updateInstalled, {
        body: t.updates.updateInstalledBody,
        tag: 'app-update',
      });
    });

    // Enable pull-to-refresh on mobile
    if (isMobile) {
      pwaService.enablePullToRefresh();
    }
  }, [t, isMobile]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await pwaService.applyUpdate();
    } catch (error) {
      console.error('Error applying update:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed ${isMobile ? 'right-4 bottom-4 left-4' : 'top-4 right-4 left-4'} z-50 mx-auto max-w-sm`}
    >
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t.updates.updateAvailable}
              </h3>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t.updates.updateAvailableBody}
              </p>
              {isMobile && (
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {t.updates.pullToRefresh}
                </p>
              )}
              <div className={`mt-3 flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 ${isMobile ? 'w-full' : ''}`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      {t.updates.updating}
                    </>
                  ) : (
                    <>
                      <Download className="h-3 w-3" />
                      {t.updates.update}
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className={`rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${isMobile ? 'w-full' : ''}`}
                >
                  {t.updates.later}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

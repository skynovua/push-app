import React, { useState, useEffect } from 'react';
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
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
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
        tag: 'app-update'
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
    <div className={`fixed ${isMobile ? 'bottom-4 left-4 right-4' : 'top-4 left-4 right-4'} z-50 mx-auto max-w-sm`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {t.updates.updateAvailable}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t.updates.updateAvailableBody}
              </p>
              {isMobile && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {t.updates.pullToRefresh}
                </p>
              )}
              <div className={`flex gap-2 mt-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className={`flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition-colors ${isMobile ? 'w-full' : ''}`}
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {t.updates.updating}
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      {t.updates.update}
                    </>
                  )}
                </button>
                <button
                  onClick={handleClose}
                  className={`px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md transition-colors ${isMobile ? 'w-full' : ''}`}
                >
                  {t.updates.later}
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

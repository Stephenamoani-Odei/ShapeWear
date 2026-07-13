import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-3 flex items-center gap-3">
      <WifiOff className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">You are offline</p>
        <p className="text-sm text-red-100">
          Some features may not work. Please check your internet connection.
        </p>
      </div>
    </div>
  );
}

export function OnlineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 z-50 bg-red-100 text-red-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium">
      <WifiOff className="w-4 h-4" />
      Offline Mode
    </div>
  );
}

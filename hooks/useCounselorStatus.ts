import { useEffect } from "react";

export function useCounselorStatus(counselorId: string) {
    useEffect(() => {
      const updateOnlineStatus = async (status: boolean) => {
        await fetch('/api/counselor/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ counselorId, isOnline: status })
        });
      };
  
      // Set online when mounted
      updateOnlineStatus(true);
  
      // Update status every 30 seconds
      const interval = setInterval(() => {
        updateOnlineStatus(true);
      }, 30000);
  
      // Handle visibility change
      const handleVisibilityChange = () => {
        updateOnlineStatus(!document.hidden);
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
  
      // Cleanup
      return () => {
        updateOnlineStatus(false);
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, [counselorId]);
  }
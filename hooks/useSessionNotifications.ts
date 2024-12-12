import { useState, useEffect } from "react";

export function useSessionNotifications(role: 'student' | 'counselor') {
    const [notification, setNotification] = useState(null);
  
    useEffect(() => {
      const eventSource = new EventSource(
        `/api/notifications/${role}`
      );
  
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setNotification(data);
      };
  
      return () => {
        eventSource.close();
      };
    }, [role]);
  
    return {
      notification,
      clearNotification: () => setNotification(null)
    };
  }
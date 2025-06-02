'use client';

import NotificationToast from '@repo/notification/novu/components/NotificationToast';
import { useEffect, useState } from 'react';

export default function NotificationTest() {
  const [isNovuConnected, setIsNovuConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          event: 'Starter Page Visit - [Next.js Starter]',
          data: {},
        }),
      });
    })();
  }, []);

  useEffect(() => {
    const checkNovuConnection = async () => {
      try {
        const response = await fetch('/api/dev-studio-status');
        const data = await response.json();
        setIsNovuConnected(data.connected);

        if (!data.connected) {
          console.log('Novu connection failed:', data.error);
        }
      } catch (error) {
        console.error('Novu connection error:', error);
        setIsNovuConnected(false);
      }
    };

    checkNovuConnection();
    const interval = setInterval(checkNovuConnection, 3000);

    return () => clearInterval(interval);
  }, []);

  const triggerNotification = async () => {
    try {
      const response = await fetch('/api/trigger', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger notification');
      }

      const data = await response.json();
      console.log('Notification triggered:', data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds

      await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          event: 'Notification Triggered - [Next.js Starter]',
          data: {},
        }),
      });
    } catch (error) {
      console.error('Error triggering notification:', error);
    }
  };

  return <NotificationToast subscriberId="novu-test-subscriber-id" />;
}

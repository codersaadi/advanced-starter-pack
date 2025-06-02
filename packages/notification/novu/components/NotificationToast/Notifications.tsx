'use client';

import { Novu } from '@novu/js';
import type { InboxProps } from '@novu/nextjs';
import { Inbox } from '@novu/nextjs';
import { novuEnv } from '@repo/env/novu'; // Adjust the import path as necessary
import { useEffect, useState } from 'react';
// @ts-expect-error: CSS module import is expected to be handled by a CSS loader
// Ensure you have a CSS module set up for styling the toast
import styles from './Notifications.module.css'; // You'll need to create this
const NotificationToast = ({ subscriberId }: { subscriberId: string }) => {
  const novu = new Novu({
    subscriberId,
    applicationIdentifier: novuEnv.NEXT_PUBLIC_NOVU_APP_ID || '',
  });

  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny:
    const listener = ({ result: notification }: { result: any }) => {
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log('Received notification:', notification);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 2500);
    };

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    // biome-ignore lint/suspicious/noConsole: <explanation>
    console.log('Setting up Novu notification listener');
    novu.on('notifications.notification_received', listener);

    return () => {
      novu.off('notifications.notification_received', listener);
    };
  }, [novu]);

  if (!showToast) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.toastContent}>New In-App Notification</div>
    </div>
  );
};

export default NotificationToast;

const novuConfig = {
  applicationIdentifier: process.env.NEXT_PUBLIC_NOVU_APP_ID || '',
  appearance: {
    elements: {
      bellContainer: {
        width: '30px',
        height: '30px',
      },
      bellIcon: {
        width: '30px',
        height: '30px',
      },
    },
  },
} satisfies Omit<InboxProps, 'subscriberId'>;

export function NovuInbox({ subscriberId }: { subscriberId: string }) {
  return <Inbox {...novuConfig} subscriberId={subscriberId} />;
}

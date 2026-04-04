'use client';

import {CSSProperties, JSX, useEffect, useState} from 'react';
import {
  getNotifications,
  removeNotification,
  subscribeToNotifications,
  type NotificationItem,
  type NotificationType,
} from '../lib/notifications';
import {CLOSESVG, INFOSVG, OKSVG} from '../utils/svg';
import Svg from './Svg';

/**
 * Styling tokens used to render each notification variant.
 */
type NotificationTheme = {
  badgeText: string;
  icon: JSX.Element;
  panel: string;
  glowColor: string;
  glowShadow: string;
};

/**
 * Resolves the UI theme tokens for a given notification type.
 */
function getNotificationTheme(type: NotificationType): NotificationTheme {
  switch (type) {
    case 'success':
      return {
        badgeText: 'text-emerald-950',
        icon: <Svg icon={OKSVG} size={40} className='' />,
        panel: 'border-emerald-300/55 text-emerald-950',
        glowColor: '#4CD643',
        glowShadow: 'rgba(76,214,67,0.95)',
      };
    case 'error':
      return {
        badgeText: 'text-red-950',
        icon: <Svg icon={CLOSESVG} size={40} className='' />,
        panel: 'border-red-300/55 text-red-950',
        glowColor: '#FF0004',
        glowShadow: 'rgba(255,0,4,0.95)',
      };
    default:
      return {
        badgeText: '',
        icon: <Svg icon={INFOSVG} size={40} className='' />,
        panel: '',
        glowColor: '#4794FF',
        glowShadow: 'rgba(71,148,255,0.95)',
      };
  }
}

/**
 * Renders a single notification card with close and progress controls.
 */
function NotificationCard({notification}: {notification: NotificationItem}) {
  const theme = getNotificationTheme(notification.type);
  const hasAutoDismiss = notification.duration > 0;
  const glowDuration = Math.max(Math.round(notification.duration * 0.9), 250);
  const borderProgressStyle = {
    '--notification-duration': `${glowDuration}ms`,
    '--notification-glow-color': theme.glowColor,
    '--notification-glow-shadow': theme.glowShadow,
  } as CSSProperties;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-full border border-primary
         bg-dark-text shadow-custom notification-toast-enter ${theme.panel}`}
      role='status'
      aria-live='polite'
    >
      {hasAutoDismiss && (
        <div
          className='notification-border-progress'
          style={borderProgressStyle}
          aria-hidden='true'
        >
          <div className='border-mask rounded-[inherit]'>
            <div className='border-glow notification-border-progress-glow rounded-[inherit]' />
          </div>
        </div>
      )}
      <div className='relative flex items-center gap-3 px-4 py-4'>
        <div className={`${theme.badgeText}`}>{theme.icon}</div>
        <div className='min-w-0 flex-1'>
          <p className='mt-1 text-md text-secondary font-semibold leading-5'>
            {notification.title}
          </p>
          {notification.message && (
            <p className='mt-1 text-secondary text-sm/5 opacity-80'>
              {notification.message}
            </p>
          )}
        </div>
        <Svg
          onClick={() => removeNotification(notification.id)}
          icon={CLOSESVG}
          size={28}
          className='absolute top-2 right-3 stroke-primary'
        />
      </div>
    </div>
  );
}

/**
 * Mounts and renders all active notifications from the shared store.
 */
export function Notification() {
  const [notifications, setNotifications] = useState(getNotifications);

  useEffect(() => subscribeToNotifications(setNotifications), []);

  return (
    <div
      className='pointer-events-none fixed top-16 left-1/2 flex w-[min(92vw,28rem)] -translate-x-1/2 flex-col gap-3'
      style={{zIndex: 110}}
    >
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

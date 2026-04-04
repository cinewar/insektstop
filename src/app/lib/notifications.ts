/**
 * Supported visual variants for application notifications.
 */
export type NotificationType = 'success' | 'error' | 'info';

/**
 * Input shape used when creating a new notification.
 */
export type NotificationOptions = {
  title: string;
  message?: string;
  type?: NotificationType;
  duration?: number;
  sticky?: boolean;
};

/**
 * Normalized notification item stored in the shared notification store.
 */
export type NotificationItem = NotificationOptions & {
  id: string;
  type: NotificationType;
  duration: number;
};

/**
 * Store subscriber callback that receives the latest notification list.
 */
type NotificationsListener = (notifications: NotificationItem[]) => void;

let notifications: NotificationItem[] = [];
const listeners = new Set<NotificationsListener>();

/**
 * Broadcasts store updates to all active notification subscribers.
 */
function emitNotifications() {
  for (const listener of listeners) {
    listener(notifications);
  }
}

/**
 * Returns the current list of notifications in the shared store.
 */
export function getNotifications() {
  return notifications;
}

/**
 * Subscribes to store changes and returns an unsubscribe function.
 */
export function subscribeToNotifications(listener: NotificationsListener) {
  listeners.add(listener);
  listener(notifications);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Removes a notification by ID and publishes the updated store state.
 */
export function removeNotification(id: string) {
  notifications = notifications.filter(
    (notification) => notification.id !== id,
  );
  emitNotifications();
}

/**
 * Adds a notification to the shared store used by the Notification UI component.
 */
export function notify({
  title,
  message,
  type = 'info',
  duration = 3200,
  sticky = false,
}: NotificationOptions) {
  const effectiveDuration = sticky ? 0 : duration;

  const notification: NotificationItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    title,
    message,
    type,
    duration: effectiveDuration,
  };

  notifications = [...notifications, notification];
  emitNotifications();

  if (effectiveDuration > 0) {
    window.setTimeout(() => {
      removeNotification(notification.id);
    }, effectiveDuration);
  }
}

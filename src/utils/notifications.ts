export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

export function sendLocalNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  
  const savedNotifs = localStorage.getItem('sentri_notifications');
  const notificationsEnabled = savedNotifs === null || savedNotifs === 'true';
  
  if (notificationsEnabled && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
    new Notification(title, {
      body,
      icon: '/logo.jpg',
    });
  }
}

// Browser Web Notification & Sound Alert Service for Resona LastMile Alert System
import { sound } from './audioSynth';

export class NotificationService {
  constructor() {
    this.permission = typeof window !== 'undefined' && 'Notification' in window 
      ? Notification.permission 
      : 'unsupported';
  }

  // Request browser system notification permission
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('System notifications are not supported in this browser environment.');
      return 'unsupported';
    }

    try {
      const perm = await Notification.requestPermission();
      this.permission = perm;
      if (perm === 'granted') {
        this.showLocalNotification('🚨 Resona Emergency Alerts Active', {
          body: 'System notifications are now enabled. You will receive real-time disaster warnings.',
          icon: '/favicon.ico',
        });
      }
      return perm;
    } catch (e) {
      console.error('Failed to request notification permission:', e);
      return 'denied';
    }
  }

  // Trigger real OS Desktop / Mobile System Notification
  showLocalNotification(title, options = {}) {
    const {
      body = 'Disaster warning issued for your sector.',
      icon = '/favicon.ico',
      badge = '/favicon.ico',
      tag = 'resona-emergency-alert',
      requireInteraction = true,
      data = null,
      playAudio = true
    } = options;

    if (playAudio) {
      try {
        sound.playEmergencySiren(1.2);
      } catch (e) {}
    }

    // 1. Dispatch custom DOM event so in-app navbar & toast components also update immediately
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('resona-emergency-broadcast', {
        detail: {
          title,
          body,
          timestamp: new Date().toISOString(),
          data
        }
      });
      window.dispatchEvent(event);
    }

    // 2. Trigger browser OS native notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(title, {
            body,
            icon,
            badge,
            tag,
            requireInteraction,
            data
          });

          notif.onclick = () => {
            window.focus();
            notif.close();
          };

          return notif;
        } catch (err) {
          console.warn('Native notification instantiation error:', err.message);
        }
      }
    }

    return null;
  }
}

export const notificationService = new NotificationService();

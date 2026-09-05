import { Injectable } from '@nestjs/common';
import { NotificationItem, NotificationPreferencesConfig } from '../types';
import { initialNotifications, initialNotificationPreferences } from '../data/mock-data';

@Injectable()
export class NotificationsService {
  private notifications: NotificationItem[] = [...initialNotifications];
  private preferences: NotificationPreferencesConfig = { ...initialNotificationPreferences };

  findAll(): NotificationItem[] { return this.notifications; }

  markAsRead(id: string): NotificationItem | undefined {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index === -1) return undefined;
    this.notifications[index] = { ...this.notifications[index], read: true };
    return this.notifications[index];
  }

  markAllAsRead(): NotificationItem[] {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    return this.notifications;
  }

  delete(id: string): boolean {
    const len = this.notifications.length;
    this.notifications = this.notifications.filter((n) => n.id !== id);
    return this.notifications.length < len;
  }

  getPreferences(): NotificationPreferencesConfig { return this.preferences; }

  updatePreferences(data: Partial<NotificationPreferencesConfig>): NotificationPreferencesConfig {
    this.preferences = { ...this.preferences, ...data };
    return this.preferences;
  }
}

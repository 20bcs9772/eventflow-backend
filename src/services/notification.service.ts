import deviceService from './device.service';
import { sendPushNotificationToMultiple } from '../config/firebase';
import notificationLogService from './notificationLog.service';

export class NotificationService {
  /**
   * Send announcement notification to all event guests
   */
  async sendAnnouncementNotification(
    eventId: string,
    announcement: { id: string; title: string; message: string }
  ): Promise<void> {
    try {
      const fcmTokens = await deviceService.getFcmTokensByEvent(eventId);

      if (fcmTokens.length > 0) {
        const results = await sendPushNotificationToMultiple(
          fcmTokens,
          announcement.title,
          announcement.message,
          {
            eventId,
            announcementId: announcement.id,
            type: 'announcement',
          }
        );

        results.forEach((result) => {
          notificationLogService.createLog({
            eventId,
            title: announcement.title,
            message: announcement.message,
            fcmToken: result.token,
            success: result.success,
            errorMessage: result.error?.message,
          }).catch((err) => {
            console.error('Error logging notification:', err);
          });
        });
      } else {
        console.warn('[Backend] No FCM tokens found for event:', eventId);
      }
    } catch (error) {
      console.error('[Backend] Error sending announcement notifications:', error);
    }
  }

  /**
   * Send schedule update notification to all event guests
   */
  async sendScheduleUpdateNotification(
    eventId: string,
    scheduleItem: unknown
  ): Promise<void> {
    try {
      const fcmTokens = await deviceService.getFcmTokensByEvent(eventId);

      if (fcmTokens.length > 0) {
        const results = await sendPushNotificationToMultiple(
          fcmTokens,
          'Schedule Updated',
          'The event schedule has been updated',
          {
            eventId,
            type: 'schedule_update',
            scheduleItem: JSON.stringify(scheduleItem),
          }
        );

        // Log notifications (fire and forget)
        results.forEach((result) => {
          notificationLogService.createLog({
            eventId,
            title: 'Schedule Updated',
            message: 'The event schedule has been updated',
            fcmToken: result.token,
            success: result.success,
            errorMessage: result.error?.message,
          }).catch((err) => {
            console.error('Error logging notification:', err);
          });
        });
      }
    } catch (error) {
      console.error('Error sending schedule update notifications:', error);
    }
  }

  /**
   * Send event update notification to all event guests
   */
  async sendEventUpdateNotification(
    eventId: string,
    event: unknown
  ): Promise<void> {
    try {
      const fcmTokens = await deviceService.getFcmTokensByEvent(eventId);

      if (fcmTokens.length > 0) {
        const results = await sendPushNotificationToMultiple(
          fcmTokens,
          'Event Updated',
          'The event details have been updated',
          {
            eventId,
            type: 'event_update',
            event: JSON.stringify(event),
          }
        );

        // Log notifications (fire and forget)
        results.forEach((result) => {
          notificationLogService.createLog({
            eventId,
            title: 'Event Updated',
            message: 'The event details have been updated',
            fcmToken: result.token,
            success: result.success,
            errorMessage: result.error?.message,
          }).catch((err) => {
            console.error('Error logging notification:', err);
          });
        });
      }
    } catch (error) {
      console.error('Error sending event update notifications:', error);
    }
  }
}

export default new NotificationService();


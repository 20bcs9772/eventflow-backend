import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from '../types';
import eventService from '../services/event.service';
import deviceService from '../services/device.service';
import notificationLogService from '../services/notificationLog.service';
import { sendPushNotificationToMultiple } from '../config/firebase';

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents>
) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join event room
    socket.on('joinEvent', async (eventId: string) => {
      try {
        // Verify event exists
        await eventService.getEventById(eventId);
        
        socket.join(`event:${eventId}`);
        console.log(`Socket ${socket.id} joined event: ${eventId}`);
        
        socket.emit('joined', { eventId, success: true });
      } catch (error) {
        console.error('Error joining event:', error);
        socket.emit('error', { message: 'Failed to join event' });
      }
    });

    // Leave event room
    socket.on('leaveEvent', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`Socket ${socket.id} left event: ${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Helper function to emit schedule updates to event room
export const emitScheduleUpdate = async (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  eventId: string,
  scheduleItem: unknown
) => {
  io.to(`event:${eventId}`).emit('scheduleUpdated', {
    eventId,
    scheduleItem,
  });
};

// Helper function to emit announcement to event room
export const emitAnnouncement = async (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  eventId: string,
  announcement: { id: string; title: string; message: string }
) => {
  // Emit to all connected clients in the event room
  io.to(`event:${eventId}`).emit('announcement', {
    eventId,
    announcement,
  });

  // Send push notifications to all guests with FCM tokens
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

      // Log notifications (fire and forget)
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
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
};

// Helper function to emit event updates
export const emitEventUpdate = (
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  eventId: string,
  event: unknown
) => {
  io.to(`event:${eventId}`).emit('eventUpdated', {
    eventId,
    event,
  });
};

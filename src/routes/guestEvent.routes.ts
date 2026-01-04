import { Router } from 'express';
import guestEventController from '../controllers/guestEvent.controller';
import { validate } from '../middleware/validation';
import { verifyFirebaseToken } from '../middleware/auth';
import { JoinEventSchema, UpdateGuestStatusSchema } from '../types';

const router = Router();

// Join event - can be called with or without auth (for public joining)
router.post('/join', validate(JoinEventSchema), guestEventController.joinEvent);

// Get my events - requires auth
router.get('/my-events', verifyFirebaseToken, guestEventController.getGuestEventsByUser);

// Get events by user ID - requires auth
router.get('/user/:userId', verifyFirebaseToken, guestEventController.getGuestEventsByUser);

// Get guests by event - requires auth (event admin only ideally, but allowing for now)
router.get('/event/:eventId', verifyFirebaseToken, guestEventController.getGuestsByEvent);

// Get a specific guest-event relation by user and event - requires auth
router.get(
  '/:userId/:eventId',
  verifyFirebaseToken,
  guestEventController.getGuestEventByUserAndEvent
);

// Update guest status - requires auth
router.patch('/:userId/:eventId/status', verifyFirebaseToken, validate(UpdateGuestStatusSchema), guestEventController.updateGuestStatus);

// Leave event - requires auth
router.delete('/:eventId', verifyFirebaseToken, guestEventController.leaveEvent);

export default router;

import { Router } from 'express';
import guestEventController from '../controllers/guestEvent.controller';
import { validate } from '../middleware/validation';
import { JoinEventSchema, UpdateGuestStatusSchema } from '../types';

const router = Router();

router.post('/join', validate(JoinEventSchema), guestEventController.joinEvent);
router.get('/user/:userId', guestEventController.getGuestEventsByUser);
router.get('/event/:eventId', guestEventController.getGuestsByEvent);
router.patch('/:userId/:eventId/status', validate(UpdateGuestStatusSchema), guestEventController.updateGuestStatus);
router.delete('/:userId/:eventId', guestEventController.leaveEvent);

export default router;

import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { validate } from '../middleware/validation';
import { CreateEventSchema, UpdateEventSchema } from '../types';

const router = Router();

router.post('/', validate(CreateEventSchema), eventController.createEvent);
router.get('/admin', eventController.getEventsByAdmin);
router.get('/shortcode/:shortCode', eventController.getEventByShortCode);
router.get('/:id', eventController.getEventById);
router.patch('/:id', validate(UpdateEventSchema), eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

export default router;

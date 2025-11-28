import { Router } from 'express';
import scheduleController from '../controllers/schedule.controller';
import { validate } from '../middleware/validation';
import { CreateScheduleItemSchema, UpdateScheduleItemSchema } from '../types';

const router = Router();

router.post('/', validate(CreateScheduleItemSchema), scheduleController.createScheduleItem);
router.get('/event/:eventId', scheduleController.getScheduleItemsByEvent);
router.get('/:id', scheduleController.getScheduleItemById);
router.patch('/:id', validate(UpdateScheduleItemSchema), scheduleController.updateScheduleItem);
router.delete('/:id', scheduleController.deleteScheduleItem);

export default router;


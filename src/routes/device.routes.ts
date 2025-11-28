import { Router } from 'express';
import deviceController from '../controllers/device.controller';
import { validate } from '../middleware/validation';
import { CreateDeviceSchema, UpdateDeviceSchema } from '../types';

const router = Router();

router.post('/', validate(CreateDeviceSchema), deviceController.createDevice);
router.get('/user/:userId', deviceController.getDevicesByUser);
router.get('/:id', deviceController.getDeviceById);
router.patch('/:id', validate(UpdateDeviceSchema), deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

export default router;


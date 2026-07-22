import { Router } from 'express';
import { patientsController } from './patients.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { uploadToCloudinary } from '../../middleware/upload';

export const patientsRouter = Router();
patientsRouter.use(authenticate);

patientsRouter.get('/', authorize('ADMIN', 'DOCTOR', 'RECEPTIONIST'), patientsController.getAll);
patientsRouter.get('/:id', patientsController.getById);
patientsRouter.put('/:id', uploadToCloudinary('avatar'), patientsController.update);
patientsRouter.delete('/:id', authorize('ADMIN'), patientsController.delete);
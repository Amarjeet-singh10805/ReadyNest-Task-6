import { Router, Request, Response, NextFunction } from 'express';
import { doctorsService } from './doctors.service';
import { sendSuccess } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const controller = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await doctorsService.getAll(page, limit, req.query.search as string, req.query.departmentId as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      sendSuccess(res, await doctorsService.getById(req.params.id));
    } catch (err) { next(err); }
  },
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await doctorsService.create(req.body);
      sendSuccess(res, result, 'Doctor created', 201);
    } catch (err) { next(err); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const avatar = (req.file as { path?: string })?.path;
      const { firstName, lastName, phone, ...doctorBody } = req.body;
      const result = await doctorsService.update(req.params.id, doctorBody, { firstName, lastName, phone, ...(avatar && { avatar }) });
      sendSuccess(res, result, 'Doctor updated');
    } catch (err) { next(err); }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await doctorsService.delete(req.params.id);
      sendSuccess(res, null, 'Doctor deleted');
    } catch (err) { next(err); }
  },
};

export const doctorsRouter = Router();
doctorsRouter.use(authenticate);
doctorsRouter.get('/', controller.getAll);
doctorsRouter.get('/:id', controller.getById);
doctorsRouter.post('/', authorize('ADMIN'), upload.single('avatar'), controller.create);
doctorsRouter.put('/:id', authorize('ADMIN', 'DOCTOR'), upload.single('avatar'), controller.update);
doctorsRouter.delete('/:id', authorize('ADMIN'), controller.delete);

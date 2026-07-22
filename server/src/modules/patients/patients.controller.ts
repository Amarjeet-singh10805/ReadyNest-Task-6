import { Request, Response, NextFunction } from 'express';
import { patientsService } from './patients.service';
import { sendSuccess } from '../../utils/response';

export const patientsController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string;
      const result = await patientsService.getAll(page, limit, search);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await patientsService.getById(req.params.id);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, address, allergies, medicalHistory, emergencyName, emergencyPhone, emergencyRel, insuranceProvider, insuranceNumber } = req.body;
      const avatar = (req.file as { path?: string })?.path;
      const result = await patientsService.update(
        req.params.id,
        { firstName, lastName, phone, ...(avatar && { avatar }) },
        { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender, bloodGroup, address, allergies, medicalHistory, emergencyName, emergencyPhone, emergencyRel, insuranceProvider, insuranceNumber }
      );
      sendSuccess(res, result, 'Patient updated');
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await patientsService.delete(req.params.id);
      sendSuccess(res, null, 'Patient deleted');
    } catch (err) { next(err); }
  },
};

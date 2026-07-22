import { patientsRepository } from './patients.repository';
import { AppError } from '../../utils/response';

export const patientsService = {
  getAll: (page = 1, limit = 10, search?: string) =>
    patientsRepository.findAll(page, limit, search),

  getById: async (id: string) => {
    const patient = await patientsRepository.findById(id);
    if (!patient) throw new AppError('Patient not found', 404);
    return patient;
  },

  update: async (id: string, body: { firstName?: string; lastName?: string; phone?: string; avatar?: string }, profile: object) => {
    const user = await patientsRepository.findById(id);
    if (!user) throw new AppError('Patient not found', 404);

    const [updatedUser] = await Promise.all([
      patientsRepository.update(id, body),
      patientsRepository.updateProfile(id, profile),
    ]);
    return updatedUser;
  },

  delete: async (id: string) => {
    const user = await patientsRepository.findById(id);
    if (!user) throw new AppError('Patient not found', 404);
    return patientsRepository.delete(id);
  },
};

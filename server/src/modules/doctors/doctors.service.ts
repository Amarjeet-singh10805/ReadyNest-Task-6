import bcrypt from 'bcryptjs';
import { doctorsRepository } from './doctors.repository';
import { AppError } from '../../utils/response';
import { prisma } from '../../config/prisma';

export const doctorsService = {
  getAll: (page = 1, limit = 10, search?: string, departmentId?: string) =>
    doctorsRepository.findAll(page, limit, search, departmentId),

  getById: async (id: string) => {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctor;
  },

  create: async (body: {
    email: string; password: string; firstName: string; lastName: string; phone?: string;
    departmentId: string; specialization: string; qualification: string; experience: number;
    consultationFee: number; licenseNumber: string; bio?: string; availableDays?: string;
    startTime?: string; endTime?: string;
  }) => {
    const existing = await prisma.user.findFirst({ where: { email: body.email } });
    if (existing) throw new AppError('Email already in use', 409);

    const hashed = await bcrypt.hash(body.password || 'Doctor@123', 12);
    const user = await prisma.user.create({
      data: { email: body.email, password: hashed, firstName: body.firstName, lastName: body.lastName, phone: body.phone, role: 'DOCTOR' },
    });

    return doctorsRepository.create({
      userId: user.id, departmentId: body.departmentId, specialization: body.specialization,
      qualification: body.qualification, experience: body.experience, consultationFee: body.consultationFee,
      licenseNumber: body.licenseNumber, bio: body.bio, availableDays: body.availableDays || 'MON,TUE,WED,THU,FRI',
      startTime: body.startTime || '09:00', endTime: body.endTime || '17:00',
    });
  },

  update: async (id: string, body: object, userBody: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) => {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);

    await prisma.user.update({ where: { id: doctor.userId }, data: userBody });
    return doctorsRepository.update(id, body);
  },

  delete: async (id: string) => {
    const doctor = await doctorsRepository.findById(id);
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctorsRepository.delete(doctor.userId);
  },
};

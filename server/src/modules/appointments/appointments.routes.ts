import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, AppError } from '../../utils/response';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { AppointmentStatus } from '@prisma/client';

export const appointmentsRouter = Router();
appointmentsRouter.use(authenticate);

// GET all appointments
appointmentsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const where: Record<string, unknown> = {};

    if (req.user?.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
      if (doctor) where.doctorId = doctor.id;
    } else if (req.user?.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({ where: { userId: req.user.userId } });
      if (patient) where.patientId = patient.id;
    } else {
      if (req.query.doctorId)  where.doctorId  = req.query.doctorId;
      if (req.query.patientId) where.patientId = req.query.patientId;
    }

    if (req.query.status) where.status = req.query.status;

    if (req.query.date) {
      const d    = new Date(req.query.date as string);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.scheduledAt = { gte: d, lt: next };
    }

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          doctor:  { include: { user: true, department: true } },
        },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.appointment.count({ where }),
    ]);

    sendSuccess(res, { data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET single appointment
appointmentsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        patient:      { include: { user: true } },
        doctor:       { include: { user: true, department: true } },
        prescription: { include: { medications: true } },
        bill:         true,
      },
    });
    if (!appt) throw new AppError('Appointment not found', 404);
    sendSuccess(res, appt);
  } catch (err) { next(err); }
});

// POST create appointment
appointmentsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, doctorId, scheduledAt, reason, type, fee, duration } = req.body;

    if (!patientId)                    throw new AppError('patientId is required', 400);
    if (!doctorId)                     throw new AppError('doctorId is required', 400);
    if (!scheduledAt)                  throw new AppError('scheduledAt is required', 400);
    if (fee === undefined || fee === null) throw new AppError('fee is required', 400);

    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new AppError('Patient profile not found', 404);

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new AppError('Doctor not found', 404);

    const result = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledAt: new Date(scheduledAt),
        duration:    duration || 30,
        type:        type || 'CONSULTATION',
        reason,
        fee:         Number(fee),
        status:      'SCHEDULED',
      },
      include: {
        patient: { include: { user: true } },
        doctor:  { include: { user: true } },
      },
    });

    sendSuccess(res, result, 'Appointment booked', 201);
  } catch (err) { next(err); }
});

// PUT update appointment
appointmentsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!appt) throw new AppError('Appointment not found', 404);

    const { status, notes, scheduledAt } = req.body;

    const result = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(status      && { status: status as AppointmentStatus }),
        ...(notes       && { notes }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
      },
    });

    sendSuccess(res, result, 'Appointment updated');
  } catch (err) { next(err); }
});

// PATCH cancel appointment
appointmentsRouter.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.appointment.update({
      where: { id: req.params.id },
      data:  { status: 'CANCELLED' },
    });
    sendSuccess(res, result, 'Appointment cancelled');
  } catch (err) { next(err); }
});

// GET today's count
appointmentsRouter.get('/stats/today', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const count    = await prisma.appointment.count({ where: { scheduledAt: { gte: today, lt: tomorrow } } });
    sendSuccess(res, { count });
  } catch (err) { next(err); }
});
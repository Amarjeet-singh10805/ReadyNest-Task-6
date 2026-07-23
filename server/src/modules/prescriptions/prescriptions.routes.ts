import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, AppError } from '../../utils/response';
import { authenticate, AuthRequest } from '../../middleware/auth';

export const prescriptionsRouter = Router();
prescriptionsRouter.use(authenticate);

prescriptionsRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const where: any = {};

    if (req.user?.role === 'DOCTOR') {
      const doc = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
      if (doc) where.doctorId = doc.id;
    } else if (req.user?.role === 'PATIENT') {
      const pat = await prisma.patient.findUnique({ where: { userId: req.user.userId } });
      if (pat) where.patientId = pat.id;
    } else {
      if (req.query.patientId) where.patientId = req.query.patientId;
      if (req.query.doctorId) where.doctorId = req.query.doctorId;
    }

    const [data, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: {
          medications: true,
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.count({ where }),
    ]);
    sendSuccess(res, { data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

prescriptionsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await prisma.prescription.findUnique({
      where: { id: req.params.id },
      include: {
        medications: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true, department: true } },
        appointment: true,
      },
    });
    if (!p) throw new AppError('Prescription not found', 404);
    sendSuccess(res, p);
  } catch (err) { next(err); }
});

prescriptionsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId, patientId, doctorId, diagnosis, symptoms, notes, followUpDate, medications } = req.body;

    if (!appointmentId || !patientId || !doctorId || !diagnosis) {
      throw new AppError('appointmentId, patientId, doctorId and diagnosis are required', 400);
    }

    const prescription = await (prisma.prescription.create as any)({
      data: {
        appointmentId,
        patientId,
        doctorId,
        diagnosis,
        symptoms,
        notes,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        medications: {
          create: (medications || []).map((m: any) => ({
            medicineName: m.medicineName,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions || null,
          })),
        },
      },
      include: {
        medications: true,
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
    sendSuccess(res, prescription, 'Prescription created', 201);
  } catch (err) { next(err); }
});

prescriptionsRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { medications, ...rest } = req.body;
    const updated = await (prisma.prescription.update as any)({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(medications && {
          medications: {
            deleteMany: {},
            create: medications.map((m: any) => ({
              medicineName: m.medicineName,
              dosage: m.dosage,
              frequency: m.frequency,
              duration: m.duration,
              instructions: m.instructions || null,
            })),
          },
        }),
      },
      include: { medications: true },
    });
    sendSuccess(res, updated, 'Prescription updated');
  } catch (err) { next(err); }
});

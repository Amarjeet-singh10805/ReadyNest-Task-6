import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess } from '../../utils/response';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get('/admin', authorize('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [totalPatients, totalDoctors, todayAppts, monthRevenue, recentAppts, monthlyStats] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT', deletedAt: null } }),
      prisma.user.count({ where: { role: 'DOCTOR', deletedAt: null } }),
      prisma.appointment.count({ where: { scheduledAt: { gte: today, lt: tomorrow } } }),
      prisma.bill.aggregate({ _sum: { totalAmount: true }, where: { status: 'PAID', paidAt: { gte: monthStart } } }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { patient: { include: { user: true } }, doctor: { include: { user: true } } },
      }),
      // Monthly appointments for the last 6 months
      Promise.all(Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); d.setDate(1); d.setHours(0,0,0,0);
        const end = new Date(d); end.setMonth(end.getMonth() + 1);
        return prisma.appointment.count({ where: { scheduledAt: { gte: d, lt: end } } }).then(count => ({
          month: d.toLocaleString('default', { month: 'short' }), count,
        }));
      })),
    ]);

    sendSuccess(res, { totalPatients, totalDoctors, todayAppts, monthRevenue: monthRevenue._sum.totalAmount || 0, recentAppts, monthlyStats });
  } catch (err) { next(err); }
});

dashboardRouter.get('/doctor', authorize('DOCTOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.userId } });
    if (!doctor) return next(new Error('Doctor not found'));

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayAppts, totalPatients, totalPrescriptions, upcomingAppts] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: doctor.id, scheduledAt: { gte: today, lt: tomorrow } } }),
      prisma.appointment.groupBy({ by: ['patientId'], where: { doctorId: doctor.id } }).then(r => r.length),
      prisma.prescription.count({ where: { doctorId: doctor.id } }),
      prisma.appointment.findMany({
        where: { doctorId: doctor.id, scheduledAt: { gte: today }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
        include: { patient: { include: { user: true } } },
        orderBy: { scheduledAt: 'asc' },
        take: 10,
      }),
    ]);

    sendSuccess(res, { todayAppts, totalPatients, totalPrescriptions, upcomingAppts });
  } catch (err) { next(err); }
});

dashboardRouter.get('/patient', authorize('PATIENT'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.userId } });
    if (!patient) return next(new Error('Patient not found'));

    const [upcomingAppts, prescriptions, bills] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: patient.id, scheduledAt: { gte: new Date() }, status: { in: ['SCHEDULED', 'CONFIRMED'] } },
        include: { doctor: { include: { user: true, department: true } } },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.prescription.findMany({
        where: { patientId: patient.id },
        include: { medications: true, doctor: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.bill.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    sendSuccess(res, { upcomingAppts, prescriptions, bills });
  } catch (err) { next(err); }
});

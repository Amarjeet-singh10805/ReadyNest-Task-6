import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth';

export const reportsRouter = Router();
reportsRouter.use(authenticate, authorize('ADMIN'));

reportsRouter.get('/appointments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    const where: Record<string, unknown> = {};
    if (from || to) where.scheduledAt = { ...(from && { gte: new Date(from as string) }), ...(to && { lte: new Date(to as string) }) };

    const [total, byStatus, byDept] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.groupBy({ by: ['status'], where, _count: true }),
      prisma.appointment.findMany({ where, include: { doctor: { include: { department: true } } } }).then(appts => {
        const map: Record<string, number> = {};
        appts.forEach(a => { const d = a.doctor.department.name; map[d] = (map[d] || 0) + 1; });
        return Object.entries(map).map(([name, count]) => ({ name, count }));
      }),
    ]);

    sendSuccess(res, { total, byStatus, byDept });
  } catch (err) { next(err); }
});

reportsRouter.get('/revenue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { from, to } = req.query;
    const where: Record<string, unknown> = { status: 'PAID' };
    if (from || to) where.paidAt = { ...(from && { gte: new Date(from as string) }), ...(to && { lte: new Date(to as string) }) };

    const [total, byMonth] = await Promise.all([
      prisma.bill.aggregate({ _sum: { totalAmount: true, paidAmount: true }, where }),
      Promise.all(Array.from({ length: 12 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (11 - i)); d.setDate(1); d.setHours(0,0,0,0);
        const end = new Date(d); end.setMonth(end.getMonth() + 1);
        return prisma.bill.aggregate({ _sum: { totalAmount: true }, where: { ...where, paidAt: { gte: d, lt: end } } })
          .then(r => ({ month: d.toLocaleString('default', { month: 'short' }), revenue: r._sum.totalAmount || 0 }));
      })),
    ]);
    sendSuccess(res, { total: total._sum, byMonth });
  } catch (err) { next(err); }
});

reportsRouter.get('/patients', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, byGender, recent] = await Promise.all([
      prisma.user.count({ where: { role: 'PATIENT', deletedAt: null } }),
      prisma.patient.groupBy({ by: ['gender'], _count: true }),
      prisma.user.findMany({ where: { role: 'PATIENT', deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 10, include: { patient: true } }),
    ]);
    sendSuccess(res, { total, byGender, recent });
  } catch (err) { next(err); }
});

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, AppError } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth';

const generateBillNumber = () => `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const billingRouter = Router();
billingRouter.use(authenticate);

billingRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const where: any = {};
    if (req.query.patientId) where.patientId = req.query.patientId;
    if (req.query.status) where.status = req.query.status;

    const [data, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: {
          patient: { include: { user: true } },
          appointment: { include: { doctor: { include: { user: true } } } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.bill.count({ where }),
    ]);
    sendSuccess(res, { data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

billingRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: req.params.id },
      include: {
        patient: { include: { user: true } },
        appointment: {
          include: {
            doctor: { include: { user: true, department: true } },
            prescription: { include: { medications: true } },
          },
        },
      },
    });
    if (!bill) throw new AppError('Bill not found', 404);
    sendSuccess(res, bill);
  } catch (err) { next(err); }
});

billingRouter.post('/', authorize('ADMIN', 'RECEPTIONIST'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appointmentId, patientId, consultFee, medicinesFee = 0, labFee = 0, otherFee = 0, discount = 0, tax = 0, notes } = req.body;

    if (!appointmentId) throw new AppError('appointmentId is required', 400);
    if (!patientId) throw new AppError('patientId is required', 400);
    if (consultFee === undefined) throw new AppError('consultFee is required', 400);

    const subtotal = Number(consultFee) + Number(medicinesFee) + Number(labFee) + Number(otherFee);
    const totalAmount = subtotal - Number(discount) + (subtotal * Number(tax) / 100);

    const bill = await (prisma.bill.create as any)({
      data: {
        appointmentId,
        patientId,
        billNumber: generateBillNumber(),
        consultFee: Number(consultFee),
        medicinesFee: Number(medicinesFee),
        labFee: Number(labFee),
        otherFee: Number(otherFee),
        discount: Number(discount),
        tax: Number(tax),
        totalAmount,
        notes,
      },
      include: { patient: { include: { user: true } } },
    });
    sendSuccess(res, bill, 'Bill created', 201);
  } catch (err) { next(err); }
});

billingRouter.patch('/:id/pay', authorize('ADMIN', 'RECEPTIONIST'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paidAmount, paymentMethod } = req.body;
    const bill = await prisma.bill.findUnique({ where: { id: req.params.id } });
    if (!bill) throw new AppError('Bill not found', 404);

    const newPaid = Number(bill.paidAmount) + Number(paidAmount);
    const status = newPaid >= Number(bill.totalAmount) ? 'PAID' : 'PARTIAL';

    const updated = await (prisma.bill.update as any)({
      where: { id: req.params.id },
      data: {
        paidAmount: newPaid,
        status,
        paymentMethod,
        paidAt: status === 'PAID' ? new Date() : undefined,
      },
    });
    sendSuccess(res, updated, 'Payment recorded');
  } catch (err) { next(err); }
});

billingRouter.get('/stats/revenue', authorize('ADMIN'), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.bill.aggregate({
      _sum: { totalAmount: true, paidAmount: true },
      where: { status: 'PAID' } as any,
    });
    sendSuccess(res, result._sum);
  } catch (err) { next(err); }
});

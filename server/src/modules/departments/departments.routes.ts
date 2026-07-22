import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, AppError } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth';

export const departmentsRouter = Router();
departmentsRouter.use(authenticate);

departmentsRouter.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: { _count: { select: { doctors: true } } },
      orderBy: { name: 'asc' },
    });
    sendSuccess(res, departments);
  } catch (err) { next(err); }
});

departmentsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dept = await prisma.department.findUnique({ where: { id: req.params.id }, include: { doctors: { include: { user: true } } } });
    if (!dept) throw new AppError('Department not found', 404);
    sendSuccess(res, dept);
  } catch (err) { next(err); }
});

departmentsRouter.post('/', authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, headDoctor } = req.body;
    const dept = await prisma.department.create({ data: { name, description, headDoctor } });
    sendSuccess(res, dept, 'Department created', 201);
  } catch (err) { next(err); }
});

departmentsRouter.put('/:id', authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, headDoctor } = req.body;
    const dept = await prisma.department.update({ where: { id: req.params.id }, data: { name, description, headDoctor } });
    sendSuccess(res, dept, 'Department updated');
  } catch (err) { next(err); }
});

departmentsRouter.delete('/:id', authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
    sendSuccess(res, null, 'Department deleted');
  } catch (err) { next(err); }
});

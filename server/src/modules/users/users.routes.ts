import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { sendSuccess, AppError } from '../../utils/response';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { uploadToCloudinary } from '../../middleware/upload';
import bcrypt from 'bcryptjs';

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { doctor: { include: { department: true } }, patient: true },
    });
    if (!user) throw new AppError('User not found', 404);
    const { password, ...safe } = user;
    void password;
    sendSuccess(res, safe);
  } catch (err) { next(err); }
});

usersRouter.put('/me', uploadToCloudinary('avatar'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const avatar = (req.file as { path?: string })?.path;
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { firstName, lastName, phone, ...(avatar && { avatar }) },
    });
    const { password, ...safe } = updated;
    void password;
    sendSuccess(res, safe, 'Profile updated');
  } catch (err) { next(err); }
});

usersRouter.put('/me/password', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError('User not found', 404);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new AppError('Current password is incorrect', 400);
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user!.userId }, data: { password: hashed } });
    sendSuccess(res, null, 'Password changed');
  } catch (err) { next(err); }
});

usersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(req.query.role && { role: req.query.role as 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT' }),
      },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, avatar: true, isActive: true, createdAt: true,
      },
    });
    sendSuccess(res, users);
  } catch (err) { next(err); }
});
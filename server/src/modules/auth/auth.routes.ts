import { Router } from 'express';
import { authController } from './auth.controller';
import { rateLimit } from 'express-rate-limit';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

export const authRouter = Router();
authRouter.post('/register', authLimiter, authController.register);
authRouter.post('/login', authLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/forgot-password', authLimiter, authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

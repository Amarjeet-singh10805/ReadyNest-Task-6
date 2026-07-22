import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = registerSchema.parse({ body: req.body });
      const result = await authService.register(body);
      sendSuccess(res, result, 'Registered successfully', 201);
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = loginSchema.parse({ body: req.body });
      const result = await authService.login(body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error('Refresh token required');
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) { next(err); }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = forgotPasswordSchema.parse({ body: req.body });
      const result = await authService.forgotPassword(body.email);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = resetPasswordSchema.parse({ body: req.body });
      const result = await authService.resetPassword(body.token, body.password);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  },
};

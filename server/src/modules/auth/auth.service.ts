import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authRepository } from './auth.repository';
import { RegisterInput, LoginInput } from './auth.validation';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { AppError } from '../../utils/response';
import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const authService = {
  register: async (input: RegisterInput) => {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) throw new AppError('Email already registered', 409);

    const hashed = await bcrypt.hash(input.password, 12);
    const user = await authRepository.create({
      ...input,
      password: hashed,
      role: (input.role as Role) || 'PATIENT',
    });

    // Auto-create patient profile if role is PATIENT
    if (user.role === 'PATIENT') {
      await prisma.patient.create({ data: { userId: user.id } });
    }

    // Auto-create doctor profile skeleton if role is DOCTOR (shouldn't happen via register but just in case)
    const payload = { userId: user.id, role: user.role, email: user.email };
    return {
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  },

  login: async (input: LoginInput) => {
    const user = await authRepository.findByEmail(input.email);
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    // Auto-create patient profile if missing
    if (user.role === 'PATIENT') {
      const existing = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!existing) await prisma.patient.create({ data: { userId: user.id } });
    }

    const payload = { userId: user.id, role: user.role, email: user.email };
    return {
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, avatar: user.avatar },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  },

  refreshToken: async (token: string) => {
    try {
      const payload = verifyRefreshToken(token);
      const user = await authRepository.findById(payload.userId);
      if (!user || !user.isActive) throw new AppError('User not found', 401);
      const newPayload = { userId: user.id, role: user.role, email: user.email };
      return {
        accessToken: generateAccessToken(newPayload),
        refreshToken: generateRefreshToken(newPayload),
      };
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  },

  forgotPassword: async (email: string) => {
    const user = await authRepository.findByEmail(email);
    if (!user) return { message: 'If the email exists, a reset token has been generated' };
    const token = crypto.randomBytes(32).toString('hex');
    const exp = new Date(Date.now() + 60 * 60 * 1000);
    await authRepository.updateResetToken(user.id, token, exp);
    return { message: 'Reset token generated', resetToken: token };
  },

  resetPassword: async (token: string, password: string) => {
    const user = await authRepository.findByResetToken(token);
    if (!user) throw new AppError('Invalid or expired reset token', 400);
    const hashed = await bcrypt.hash(password, 12);
    await authRepository.updatePassword(user.id, hashed);
    return { message: 'Password reset successfully' };
  },
};
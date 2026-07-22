import { prisma } from '../../config/prisma';
import { Role } from '@prisma/client';

export const authRepository = {
  findByEmail: (email: string) =>
    prisma.user.findFirst({ where: { email, deletedAt: null } }),

  findByResetToken: (token: string) =>
    prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() }, deletedAt: null },
    }),

  create: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
  }) => prisma.user.create({ data }),

  updateResetToken: (id: string, token: string | null, exp: Date | null) =>
    prisma.user.update({
      where: { id },
      data: { resetToken: token, resetTokenExp: exp },
    }),

  updatePassword: (id: string, password: string) =>
    prisma.user.update({ where: { id }, data: { password, resetToken: null, resetTokenExp: null } }),

  findById: (id: string) =>
    prisma.user.findFirst({ where: { id, deletedAt: null } }),
};

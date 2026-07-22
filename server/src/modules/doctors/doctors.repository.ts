import { prisma } from '../../config/prisma';

export const doctorsRepository = {
  findAll: async (page: number, limit: number, search?: string, departmentId?: string) => {
    const where: Record<string, unknown> = {
      user: { deletedAt: null },
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { user: { firstName: { contains: search } } },
        { user: { lastName: { contains: search } } },
      ];
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where: where as Parameters<typeof prisma.doctor.findMany>[0]['where'],
        include: { user: true, department: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.doctor.count({
        where: where as Parameters<typeof prisma.doctor.count>[0]['where'],
      }),
    ]);

    return { data: doctors, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  findById: (id: string) =>
    prisma.doctor.findUnique({
      where: { id },
      include: {
        user: true,
        department: true,
        appointments: {
          include: { patient: { include: { user: true } } },
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
      },
    }),

  findByUserId: (userId: string) =>
    prisma.doctor.findUnique({
      where: { userId },
      include: { user: true, department: true },
    }),

  create: (data: object) =>
    prisma.doctor.create({
      data: data as Parameters<typeof prisma.doctor.create>[0]['data'],
      include: { user: true, department: true },
    }),

  update: (id: string, data: object) =>
    prisma.doctor.update({
      where: { id },
      data: data as Parameters<typeof prisma.doctor.update>[0]['data'],
      include: { user: true, department: true },
    }),

  delete: (id: string) =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),

  count: () => prisma.doctor.count({ where: { user: { deletedAt: null } } }),
};
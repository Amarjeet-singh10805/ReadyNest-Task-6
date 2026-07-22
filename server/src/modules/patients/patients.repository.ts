import { prisma } from '../../config/prisma';

export const patientsRepository = {
  findAll: async (page: number, limit: number, search?: string) => {
    const where: Record<string, unknown> = { role: 'PATIENT', deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName:  { contains: search } },
        { email:     { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { patient: true },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Auto-create missing patient profiles
    for (const u of users) {
      if (!u.patient) {
        u.patient = await prisma.patient.create({ data: { userId: u.id } });
      }
    }

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  findById: (id: string) =>
    prisma.user.findFirst({
      where: { id, role: 'PATIENT', deletedAt: null },
      include: {
        patient: {
          include: {
            appointments: {
              include: { doctor: { include: { user: true, department: true } } },
              orderBy: { scheduledAt: 'desc' },
              take: 10,
            },
            prescriptions: {
              include: { medications: true, doctor: { include: { user: true } } },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            bills: { orderBy: { createdAt: 'desc' }, take: 10 },
          },
        },
      },
    }),

  findPatientByUserId: (userId: string) =>
    prisma.patient.findUnique({ where: { userId } }),

  update: (id: string, data: object) =>
    prisma.user.update({ where: { id }, data }),

  updateProfile: (userId: string, data: object) =>
    prisma.patient.upsert({
      where:  { userId },
      update: data,
      create: { userId, ...data },
    }),

  delete: (id: string) =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),

  count: () => prisma.user.count({ where: { role: 'PATIENT', deletedAt: null } }),
};
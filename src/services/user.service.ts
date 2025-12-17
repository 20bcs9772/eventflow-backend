import prisma from '../config/database';
import { CreateUserInput, UpdateUserInput } from '../types';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  async createUser(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: 'GUEST',
      },
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        guestEvents: {
          where: { deletedAt: null },
          include: {
            event: {
              where: { deletedAt: null },
            },
          },
        },
        devices: {
          where: { deletedAt: null },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return user;
  }

  async deleteUserByFirebaseUid(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    // Soft delete
    return prisma.user.update({
      where: { firebaseUid },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateUser(id: string, data: UpdateUserInput) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    // Soft delete
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async listUsers(limit: number = 20, offset: number = 0, search?: string) {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }
}

export default new UserService();

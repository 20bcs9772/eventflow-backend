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
}

export default new UserService();

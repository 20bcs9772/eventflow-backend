import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthProvider, Prisma } from '@prisma/client';

interface CreateOrUpdateUserInput {
  firebaseUid: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
}

interface UserResponse {
  id: string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  authProvider: AuthProvider;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSelectFields = {
  id: true,
  firebaseUid: true,
  email: true,
  name: true,
  avatarUrl: true,
  authProvider: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AuthService {
  /**
   * Register a new user or return existing user
   * Uses upsert to handle race conditions when multiple requests come in simultaneously
   */
  async registerOrLoginUser(data: CreateOrUpdateUserInput): Promise<UserResponse> {
    try {
      // Use upsert to atomically create or update the user
      // This prevents race conditions when multiple login requests come in at once
      const user = await prisma.user.upsert({
        where: { firebaseUid: data.firebaseUid },
        update: {
          // Update email if provided (for social logins that might update email)
          ...(data.email && { email: data.email }),
          // Update name only if provided and not empty
          ...(data.name && { name: data.name }),
          // Update avatar if provided (social login avatars)
          ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        },
        create: {
          firebaseUid: data.firebaseUid,
          email: data.email,
          name: data.name,
          avatarUrl: data.avatarUrl,
          authProvider: data.authProvider,
          role: 'GUEST',
        },
        select: userSelectFields,
      });

      return user;
    } catch (error) {
      // Handle unique constraint error on email (different user has this email)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = error.meta?.target as string[] | undefined;
          if (target?.includes('email')) {
            throw new AppError(
              'An account with this email already exists. Please sign in with your original method.',
              409
            );
          }
        }
      }
      throw error;
    }
  }

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      authProvider: user.authProvider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get current user with full profile data
   */
  async getCurrentUser(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: {
        guestEvents: {
          where: { deletedAt: null },
          include: {
            event: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                location: true,
                type: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        eventsCreated: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            location: true,
            type: true,
            shortCode: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        devices: {
          where: { deletedAt: null },
          select: {
            id: true,
            deviceType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    firebaseUid: string,
    data: { name?: string; avatarUrl?: string }
  ) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    return prisma.user.update({
      where: { firebaseUid },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl,
      },
      select: userSelectFields,
    });
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(firebaseUid: string) {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user || user.deletedAt) {
      throw new AppError('User not found', 404);
    }

    // Soft delete
    await prisma.user.update({
      where: { firebaseUid },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true, message: 'Account deleted successfully' };
  }
}

export default new AuthService();

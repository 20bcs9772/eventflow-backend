import { Request, Response } from 'express';
import userService from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';

export class UserController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getUserById(req.params.id);
    res.json({
      success: true,
      data: user,
    });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({
      success: true,
      data: user,
    });
  });

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.q as string) || undefined;

    const users = await userService.listUsers(limit, offset, search);
    res.json({
      success: true,
      data: users,
    });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export default new UserController();


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
}

export default new UserController();


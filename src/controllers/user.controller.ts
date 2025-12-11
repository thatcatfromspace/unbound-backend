import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { authService } from "../services/auth.service";

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password } = req.body;

    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate API Key
    const apiKey = await authService.createApiKey(user.id);

    res.status(201).json({ user, apiKey });
  } catch (error) {
    next(error);
  }
};

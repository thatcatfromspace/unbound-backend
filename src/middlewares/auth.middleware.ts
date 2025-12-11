import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { User, Role } from "@prisma/client";

// just a workaround to add user to the request, TS sholdn't complain
declare global {
  namespace Express {
    interface Request {
      user?: User | { userId: number };
    }
  }
}

export const requireApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const apiKey = req.headers["x-api-key"] as string;

  if (!apiKey) {
    res.status(401).json({ error: "Missing x-api-key header" });
    return;
  }

  try {
    const user = await authService.validateApiKey(apiKey);
    if (!user) {
      res.status(401).json({ error: "Invalid API Key" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || !("role" in req.user) || req.user.role !== Role.ADMIN) {
    res.status(403).json({ error: "Access denied." });
    return;
  }
  next();
};

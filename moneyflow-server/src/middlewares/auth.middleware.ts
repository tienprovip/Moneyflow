import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { t } from "../i18n";

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: t(req, "auth.notAuthorized") });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: t(req, "auth.invalidToken") });
  }
};

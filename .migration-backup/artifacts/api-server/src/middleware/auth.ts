import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? null : "dev-only-secret-not-for-production");

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET as string);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token tidak valid atau sudah kadaluarsa" });
  }
}

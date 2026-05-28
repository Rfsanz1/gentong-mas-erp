import { Router } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? null : "dev-only-secret-not-for-production");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production");
}

const ENABLE_DEMO_AUTH = process.env.ENABLE_DEMO_AUTH === "true" || !IS_PRODUCTION;

const DEMO_USERS = ENABLE_DEMO_AUTH
  ? [
      {
        id: "demo-1",
        email: "admin@example.com",
        password: "admin123",
        name: "Administrator",
        role: "admin",
        permissions: ["*"],
      },
      {
        id: "demo-2",
        email: "user@example.com",
        password: "user123",
        name: "Staff User",
        role: "staff",
        permissions: ["read"],
      },
    ]
  : [];

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function buildTokenPayload(user: { id: string | number; email: string; name: string; role: string; permissions: string[] }) {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
    roles: [user.role],
    permissions: user.permissions,
  };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password diperlukan" });
  }

  const demoUser = DEMO_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (demoUser) {
    const payload = buildTokenPayload(demoUser);
    const accessToken = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "8h" });
    const refreshToken = jwt.sign({ id: demoUser.id }, JWT_SECRET as string, { expiresIn: "30d" });
    return res.json({ accessToken, refreshToken, user: payload });
  }

  try {
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const hashed = hashPassword(password);
    if (dbUser.passwordHash !== hashed) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const payload = buildTokenPayload({
      id: String(dbUser.id),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      permissions: dbUser.permissions ?? [],
    });
    const accessToken = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "8h" });
    const refreshToken = jwt.sign({ id: String(dbUser.id) }, JWT_SECRET as string, { expiresIn: "30d" });
    return res.json({ accessToken, refreshToken, user: payload });
  } catch (err) {
    console.error("Login DB error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token diperlukan" });
  }
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET as string) as { id: string };

    const demoUser = DEMO_USERS.find((u) => u.id === payload.id);
    if (demoUser) {
      const tokenPayload = buildTokenPayload(demoUser);
      const accessToken = jwt.sign(tokenPayload, JWT_SECRET as string, { expiresIn: "8h" });
      return res.json({ accessToken });
    }

    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(payload.id)))
      .limit(1);

    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const tokenPayload = buildTokenPayload({
      id: String(dbUser.id),
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      permissions: dbUser.permissions ?? [],
    });
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET as string, { expiresIn: "8h" });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Refresh token tidak valid" });
  }
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token tidak ditemukan" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET as string);
    return res.json(payload);
  } catch {
    return res.status(401).json({ message: "Token tidak valid" });
  }
});

export default router;

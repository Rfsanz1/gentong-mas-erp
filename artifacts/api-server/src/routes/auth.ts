import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || (IS_PRODUCTION ? null : "dev-only-secret-not-for-production");
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required in production");
}

const IS_DEMO = process.env.NODE_ENV !== "production";

const DEMO_USERS =
  IS_DEMO
    ? [
        {
          id: "1",
          email: "admin@example.com",
          password: "admin123",
          name: "Administrator",
          roles: ["admin"],
          permissions: ["*"],
        },
        {
          id: "2",
          email: "user@example.com",
          password: "user123",
          name: "Staff User",
          roles: ["staff"],
          permissions: ["read"],
        },
      ]
    : [];

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = DEMO_USERS.find(
    (u) => u.email === email && u.password === password,
  );

  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  const { password: _pw, ...userWithoutPassword } = user;
  const accessToken = jwt.sign(userWithoutPassword, JWT_SECRET, {
    expiresIn: "8h",
  });
  const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  return res.json({ accessToken, refreshToken, user: userWithoutPassword });
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }
  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    const user = DEMO_USERS.find((u) => u.id === payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { password: _pw, ...userWithoutPassword } = user;
    const accessToken = jwt.sign(userWithoutPassword, JWT_SECRET, {
      expiresIn: "8h",
    });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json(payload);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

export default router;

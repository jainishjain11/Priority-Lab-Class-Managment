import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "Email and password required" });
  }
  const users = await db.select().from(usersTable).where(eq(usersTable.email, email));
  const user = users[0];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid credentials" });
  }
  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    token: `mock-token-${user.id}`,
    message: "Login successful",
  });
});

router.post("/register", async (req, res) => {
  const { name, email, password, role, department, registrationNumber } = req.body;
  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "All required fields must be provided" });
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    return res.status(400).json({ error: "DUPLICATE", message: "Email already registered" });
  }
  const id = randomUUID();
  await db.insert(usersTable).values({ id, name, email, password, role, department, registrationNumber });
  const user = { id, name, email, role, department };
  return res.status(201).json({ user, token: `mock-token-${id}`, message: "Registration successful" });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "UNAUTHORIZED", message: "Not authenticated" });
  const token = auth.replace("Bearer ", "");
  const userId = token.replace("mock-token-", "");
  const users = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = users[0];
  if (!user) return res.status(401).json({ error: "UNAUTHORIZED", message: "Invalid token" });
  return res.json({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department });
});

export default router;

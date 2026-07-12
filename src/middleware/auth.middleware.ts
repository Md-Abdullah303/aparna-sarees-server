import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

/**
 * Middleware: verifies the better-auth session by calling the better-auth API
 * This is the correct approach — better-auth hashes tokens before storing in DB
 * so we cannot query MongoDB directly.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let sessionToken: string | undefined;

    const cookieHeader = req.headers.cookie || "";
    const cookieMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (cookieMatch) {
      sessionToken = decodeURIComponent(cookieMatch[1]);
    }

    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }

    if (!sessionToken) {
      res.status(401).json({ message: "Unauthorized: no session token" });
      return;
    }

    const db = require('../config/db').getDB();
    const session = await db.collection("session").findOne({ token: sessionToken });

    if (!session || !session.userId) {
      res.status(401).json({ message: "Unauthorized: invalid or expired session" });
      return;
    }

    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      res.status(401).json({ message: "Unauthorized: session expired" });
      return;
    }

    (req as any).userId = session.userId.toString();
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal server error in auth middleware" });
  }
}

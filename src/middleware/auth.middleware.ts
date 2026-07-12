import { Request, Response, NextFunction } from "express";
import { getDB } from "../config/db";

/**
 * Middleware: verifies the better-auth session cookie/token
 * and attaches user info to req.user
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const db = getDB();

    // better-auth stores session in cookie named "better-auth.session_token"
    // It can also come as Authorization: Bearer <token>
    let sessionToken: string | undefined;

    const cookieHeader = req.headers.cookie || "";
    const cookieMatch = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (cookieMatch) {
      sessionToken = decodeURIComponent(cookieMatch[1]);
    }

    // Fallback: Authorization header
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

    // Look up session in the DB (better-auth stores sessions in "session" collection)
    const session = await db.collection("session").findOne({ token: sessionToken });

    if (!session || !session.userId) {
      res.status(401).json({ message: "Unauthorized: invalid or expired session" });
      return;
    }

    // Check expiry
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      res.status(401).json({ message: "Unauthorized: session expired" });
      return;
    }

    // Attach user id to request
    (req as any).userId = session.userId.toString();
    next();
  } catch (err) {
    next(err);
  }
}

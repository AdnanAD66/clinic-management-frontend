// ==========================================
// JWT Sign & Verify Helpers
// ==========================================

import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/lib/types";
import { JWT_EXPIRY } from "@/lib/constants";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

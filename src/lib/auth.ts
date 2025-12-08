import { randomBytes, createHash } from "crypto";
import argon2 from "argon2";
import { prisma } from "./db";
import { serialize, parse } from "cookie";

/**
 * Hash a token (SHA-256) for storing in DB.
 */
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Hash a plain password using argon2.
 */
export async function hashPassword(plain: string) {
  return argon2.hash(plain);
}

/**
 * Verify a plain password against an argon2 hash.
 */
export async function verifyPassword(hash: string, plain: string) {
  try {
    return await argon2.verify(hash, plain);
  } catch (e) {
    return false;
  }
}

/**
 * Create a server-side session: store hash(token) in DB and return raw token + Set-Cookie value.
 */
export async function createSession(userId: number, maxAgeSeconds: number) {
  const token = randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await prisma.session.create({
    data: { userId, tokenHash, expiresAt },
  });

  const cookie = serialize("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return { token, cookie };
}

/**
 * Get user object associated with a raw token string (from cookie).
 */
export async function getUserFromToken(token?: string) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  if (session.user.isDisabled) return null;
  return session.user;
}

/**
 * Revoke a session by raw token (deletes session records matching tokenHash).
 */
export async function revokeSession(token?: string) {
  if (!token) return;
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

/**
 * Parse a raw `Cookie` header value and return the `session` token if present.
 */
export function parseTokenFromCookieHeader(cookieHeader?: string) {
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies.session || null;
}

/**
 * Build a Set-Cookie header value that clears the session cookie.
 */
export function clearSessionCookie() {
  return serialize("session", "", { httpOnly: true, path: "/", maxAge: 0 });
}

export default {
  hashToken,
  hashPassword,
  verifyPassword,
  createSession,
  getUserFromToken,
  revokeSession,
  parseTokenFromCookieHeader,
  clearSessionCookie,
};

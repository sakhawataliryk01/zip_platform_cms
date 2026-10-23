import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { SessionUser } from "@/types";
import { DEMO_CREDENTIALS } from "@/lib/mock/data";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days
const SESSION_DURATION_REMEMBER = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    "dev-auth-secret-change-me-in-production-32chars";
  return new TextEncoder().encode(secret);
}

/** Prefer Secure cookies when the public app URL is HTTPS (e.g. ngrok). */
export function sessionCookieSecure() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl.startsWith("https://")) return true;
  return process.env.NODE_ENV === "production";
}

export function sessionCookieOptions(remember = false) {
  const maxAge = remember ? SESSION_DURATION_REMEMBER : SESSION_DURATION;
  return {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(
  user: SessionUser,
  remember = false
): Promise<string> {
  const exp = remember ? SESSION_DURATION_REMEMBER : SESSION_DURATION;
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${exp}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string, remember = false) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(remember));
}

/** Attach session cookie directly on a Route Handler response (more reliable). */
export function applySessionCookie(
  response: NextResponse,
  token: string,
  remember = false
) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(remember));
  return response;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const normalized = email.trim().toLowerCase();

  if (
    normalized === DEMO_CREDENTIALS.admin.email &&
    password === DEMO_CREDENTIALS.admin.password
  ) {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Platform Admin",
      email: DEMO_CREDENTIALS.admin.email,
      role: "ADMIN",
      status: "ACTIVE",
    };
  }

  if (
    normalized === DEMO_CREDENTIALS.merchant.email &&
    password === DEMO_CREDENTIALS.merchant.password
  ) {
    return {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Ahmed Merchant",
      email: DEMO_CREDENTIALS.merchant.email,
      role: "MERCHANT",
      status: "ACTIVE",
      merchantId: "00000000-0000-0000-0000-000000000010",
      businessName: "ABC Store",
    };
  }

  return null;
}

export { SESSION_COOKIE } from "@/lib/auth/constants";

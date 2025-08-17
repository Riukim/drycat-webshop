import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from "jose";
import { serialize } from "cookie";
import { cookies } from "next/headers";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    console.warn(`Using default JWT_SECRET - change for production`);
    return "dev-secret-change-me"
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long");
  }
  return secret;
})()

export const COOKIE_NAME = "session_token" as const

// interfaccia per il payload della sessione
interface SessionPayload {
  userId: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// password hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT session managment
export async function createSessionToken(userId: string, userRole?: string): Promise<string> {
  const encoder = new TextEncoder();
  const secret = encoder.encode(JWT_SECRET);

  const jwt = await new SignJWT({
    sub: userId,
    role: userRole,
    iat: Math.floor(Date.now() / 1000),
  })
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)

  return jwt
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const encoder = new TextEncoder();
    const secret = encoder.encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const sub = payload.sub as string | undefined;
    if (!sub) return null;

    return {
      userId: sub,
      role: payload.role as string | undefined,
      iat: payload.iat as number | undefined,
      exp: payload.exp as number | undefined,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Cookie managment
export function createSessionCookie(token: string): string {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 gg
  })
}

export function clearSessionCookie(): string {
  return serialize(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

// Helper per ottenere la sessione corrente
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  return await verifySessionToken(token);
}

// Helper per validare se l'utente è autenticato
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}
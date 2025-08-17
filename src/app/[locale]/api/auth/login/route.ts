import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, createSessionToken, createSessionCookie } from '@/lib/auth';
import { assertSameOrigin, normalizeEmail } from '@/lib/utils';
import { z } from 'zod';

// Schema di validazione per il login
const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
})

// Rate limiting per login
const loginAttempts = new Map<string, {count: number, resetTime: number, lastAttempt: number}>()

function checkLoginRateLimit(identifier: string): {allowed: boolean, waitTime?: number} {
  const now = Date.now()
  const record = loginAttempts.get(identifier)

  if (!record || now > record.resetTime) {
    loginAttempts.set(identifier, {count: 1, resetTime: now + 15 * 60 * 1000, lastAttempt: now})
    return {allowed: true}
  }

  // Backoff progressivo
  const timeSinceLastAttempt = now - record.lastAttempt
  const minWaitTime = Math.min(record.count * 1000, 3000) // max 30 sec

  if (timeSinceLastAttempt < minWaitTime) {
    return {
      allowed: false,
      waitTime: Math.ceil((minWaitTime - timeSinceLastAttempt) / 1000)
    }
  }

  if (record.count > 5) {
    return {
      allowed: false,
      waitTime: Math.ceil((record.resetTime - now) / 1000)
    }
  }
  record.count++
  record.lastAttempt = now
  return {allowed: true}
}

export async function POST(req: Request) {
  try {
    // Verifica anti-CSRF
    if (!assertSameOrigin(req)) {
      return NextResponse.json(
        {error: "Invalid origin"},
        {status: 403}
      )
    }

    // Rate limiting basato sull'indirizzo IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    const rateLimit = checkLoginRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {error: `Too many loin attempts. Please wait ${rateLimit.waitTime} seconds.`},
        {status: 429}
      )
    }

    // Parse e validazione del body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }

    // Parse e validazione del body
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
      {status: 400}
      )
    }

    const {email, password} = validation.data
    const normalizedEmail = normalizeEmail(email)

    // Verifica utente
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      }
    })

    // Verifica delle credenziali, diamo stessa risposta per utente non trovato o
    // password sbagliata
    if (!user) {
      // Simuliamo tempo di verifica password per evitare timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      return NextResponse.json(
        {error: "Invalid email or password"},
        {status: 401}
      )
    }

    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      // Rate limiting anche per email specifica dopo fallimento
      checkLoginRateLimit(normalizedEmail)
      return NextResponse.json(
        {error: "Invalid email or password"},
        {status: 401}
      )
    }

    // reset rate limiting per IP dopo login riuscito
    loginAttempts.delete(ip)
    loginAttempts.delete(normalizedEmail)

    // creazione sessione
    const token = await createSessionToken(user.id)
    const cookie = createSessionCookie(token)

    // Payload utente senza password
    const userPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }

    console.log(`User logged in: ${user.email} (ID: ${user.id})`)

    return NextResponse.json(
      {
        success: true,
        message: 'User logged in successfully',
        user: userPayload,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookie
        }
      }
    )
  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      {error: "Internal Server Error. Please try again later"},
      {status: 500}
    )
  }
}

// Gestione metodi non supportati
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
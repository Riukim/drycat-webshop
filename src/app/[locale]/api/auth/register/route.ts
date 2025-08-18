import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";
import {PrismaClient} from "@prisma/client";
import {
  hashPassword,
  createSessionToken,
  createSessionCookie,
  verifySessionToken,
  clearSessionCookie
} from "@/lib/auth";
import { assertSameOrigin, normalizeEmail } from '@/lib/utils';
import {z} from "zod";
import { cookies } from 'next/headers';

// Schema di validazione per email
const registerSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number'),
  firstName: z.string().trim().min(3, "First name is required").max(50),
  lastName: z.string().trim().min(3, "Last name is required").max(50),
})

// Semplice rate limit
const attempts = new Map<string, {count: number; resetTime: number}>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetTime) {
    attempts.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 }); // Reset dopo 15 minuti
    return true;
  }

  if (record.count >= 5) { // Max 5 tentativi per IP
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Verifica anti-CSRF
    if (!assertSameOrigin(req)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }

    // Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {status: 429}
      )
    }

    let body
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {error: "Invalid JSON format"},
        {status: 400}
      )
    }

    // Validazione con Zod
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const {email, password, firstName, lastName, } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    // Controllo se utente già esistente
    const existingUser = await prisma.user.findUnique({
      where: {email: normalizedEmail},
      select: {id: true},
    });

    if (existingUser) {
      return NextResponse.json(
        {error: "An account with this email is already registered."},
        {status: 409}
      )
    }

    // hash della password
    const passwordHash = await hashPassword(password);

    // Creazione utente con transazione per atomicità
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: passwordHash,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    // Creazione session
    const token = await createSessionToken(user.id);
    const cookie = createSessionCookie(token);

    console.log(`New user registered: ${user.email} (ID: ${user.id})`);

    return NextResponse.json(
      {
        success: true,
        message: "Account registered successfully",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": cookie
        }
      }
    )
  } catch (error) {
    console.error("Registration error:", error);

    // Gestione errori specifici di prisma
    if (error instanceof Error) {
      // Constraint violation (email univoca)
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          {error: "An account with this email is already registered."},
          {status: 409}
        )
      }
    }

    // Errore generico
    return NextResponse.json(
      {error: "Internal Server Error. Please try again later."},
      {status: 500}
    )
  }
}

// Metodo per richiedere info utente
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json(
        {
          error: "Not authenticated",
        },
        {status: 401}
      )
    }

    // Verifica del token di sessione
    const session = await verifySessionToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        {error: "Invalid session."},
        {status: 401}
      )
    }

    // Recupero dei dati utente dal database
    const user = await prisma.user.findUnique({
      where: {id: session.userId},
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        {error: "User not found"},
        {status: 404}
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      }
    })

  } catch (error) {
    console.error('Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(request: Request) {
  try {
    // Verifica anti-CSRF
    if (!assertSameOrigin(request)) {
      return NextResponse.json(
        {error: "Invalid origin" },
        {status: 403}
      )
    }

    // Verifica autenticazione
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Recupero il cookie
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return NextResponse.json(
        {error: "Authentication required."},
        {status: 401}
      )
    }

    // Verifica del token
    const session = await verifySessionToken(sessionToken)
    if (!session) {
      return NextResponse.json(
        {error: "Invalid session."},
        {status: 401}
      )
    }

    const userId = session.userId

    // Verifica utente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Cancellazione dell'utente
    const deletedUser = await prisma.user.delete({
      where: {id: userId},
      select: {id: true, email: true},
    })

    // Pulizia del cookie
    const clearCookie = clearSessionCookie()

    console.log(`User deleted: ${deletedUser.email} (ID: ${deletedUser.id})`)

    return NextResponse.json(
      {
        success: true,
        message: "Account deleted successfully",
        user: { id: user.id, email: user.email },
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": clearCookie
        }
      }
    )

  } catch (error) {
    console.error('Delete user error:', error);

    if (error instanceof PrismaClient.PrismaClientKnownRequestError) {
      // @ts-ignore
      if (error.code === 'P2025') {
        // Record to delete does not exist
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
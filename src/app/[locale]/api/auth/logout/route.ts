import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionCookie, verifySessionToken } from '@/lib/auth';
import { assertSameOrigin } from "@/lib/utils"

export async function POST(req: Request) {
  try {
    // Verifica anti-CSRF
    if (!assertSameOrigin(req)) {
      return NextResponse.json(
        {error: "Invalid Origin"},
        {status: 403}
      )
    }

    // Recupero cookie di sessione
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    // Verifica se c'era una sessione valida
    let userId: string | undefined
    if (sessionToken) {
      const session = await verifySessionToken(sessionToken)
      userId = session?.userId
    }

    // Pulizia cookie
    const clearCookie = clearSessionCookie()

    // Log del logout per debugging
    if (userId) {
      console.log(`User logged out: ID ${userId}`)
    }

    return NextResponse.json(
      {
        success: true,
        message: `User logged out successfully.`,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": clearCookie
        }
      }
    )
  } catch (error) {
    console.error("Logout error: ", error)

    // Puliamo i cookie anche in questo caso
    const clearCookie = clearSessionCookie()

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
        headers: {
          "Set-Cookie": clearSessionCookie()
        }
      }
    )
  }
}

// Gestione metodi non supportati
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for logout.' },
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
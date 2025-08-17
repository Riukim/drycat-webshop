import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function assertSameOrigin(req: Request): boolean {
  const allowed = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const origin = req.headers.get("origin")
  const referer = req.headers.get("referer")

  if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_APP_URL && !origin && !referer) {
    return true
  }

  return (
    (origin && origin.startsWith(allowed)) ||
    (referer && referer.startsWith(allowed))
  )
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function isEmailNormalized(email: string): boolean {
  return email === normalizeEmail(email)
}

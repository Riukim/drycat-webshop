"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SiteHeader({ locale = "it" }: { locale?: string }) {
  const pathname = usePathname();
  const nav = [
    { href: `/${locale}/shop`, label: "Shop" },
    { href: `/${locale}/about`, label: "About" },
    { href: `/${locale}/contact`, label: "Contact" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 border-b bg-background/70 backdrop-blur" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          {/* Replace with your <Image> logo if available */}
          <div className="w-9 h-9 rounded-full border" style={{ borderColor: "var(--border)" }} />
          <span className="tracking-widest text-sm">DRYCAT GIN©</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/${locale}/login`}>Sign in</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href={`/${locale}/shop`}>Buy now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
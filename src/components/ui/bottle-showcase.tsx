import Image from "next/image";

export default function BottleShowcase() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border bg-background" style={{ borderColor: "var(--border)" }}>
            <Image src="/images/hero-distillery-placeholder.jpg" alt="Distillery detail" fill className="object-cover" />
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl md:text-5xl font-semibold font-[var(--font-display)]">Calibrated clarity.</h2>
          <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
            No unnecessary flourish—just balance, texture, and a long, dry finish. Designed to stand neat, or anchor the sharpest martinis.
          </p>
          <div className="mt-6 text-sm text-muted-foreground grid grid-cols-2 gap-4 max-w-md">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>Juniper • Citrus • Subtle spice</div>
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>Filtered cold • 43% ABV</div>
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>700ml • Small batch</div>
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)" }}>Italian provenance</div>
          </div>
        </div>
      </div>
    </section>
  );
}
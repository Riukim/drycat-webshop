"use client"

import React, { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    title: "Precise Distillation",
    body: "Slow distillation for a clean, layered profile.",
    key: "distillation",
    img: "/branding/drycatBianco.png",
  },
  {
    title: "Curated Botanicals",
    body: "Juniper-forward, complemented by restrained citrus.",
    key: "botanicals",
    img: "/branding/drycatNero.png",
  },
  {
    title: "Monochrome Aesthetic",
    body: "Minimal design, maximum character—timeless and bold.",
    key: "design",
    img: "/branding/drycatVerde.png",
  },
];

export default function FeatureCarousel() {
  // Creiamo 3 set per garantire un loop fluido
  const items = React.useMemo(() => [...FEATURES, ...FEATURES, ...FEATURES], []);
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateAnimation = () => {
      // Calcola la larghezza di un singolo set di elementi
      const cardWidth = 300 + 24; // larghezza card + gap
      const singleSetWidth = FEATURES.length * cardWidth;

      // Velocità di scorrimento (pixel per secondo)
      const pxPerSecond = 50;
      const durationSec = singleSetWidth / pxPerSecond;

      el.style.setProperty("--marquee-duration", `${durationSec}s`);
      el.style.setProperty("--single-set-width", `${singleSetWidth}px`);
    };

    updateAnimation();
    window.addEventListener("resize", updateAnimation);
    return () => window.removeEventListener("resize", updateAnimation);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden py-12 md:py-20 bg-background"
      aria-label="Feature carousel"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Our Premium Gin
        </h2>
        <p className="text-muted-foreground">Discover what makes our product exceptional</p>
      </div>

      <div
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`marquee-track ${isPaused ? "marquee-paused" : ""}`}
      >
        {items.map((feature, idx) => (
          <div key={`${feature.key}-${idx}`} className="marquee-item">
            <div className="min-w-[300px] max-w-xs flex-shrink-0 rounded-2xl border-border bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="p-6">
                <h3 className="text-lg md:text-xl font-semibold text-card-foreground mb-4">
                  {feature.title}
                </h3>
                <div className="mb-4">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="h-40 w-full rounded-md object-cover"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
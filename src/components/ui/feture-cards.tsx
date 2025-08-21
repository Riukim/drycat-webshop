"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const FEATURES = [
  {
    title: "Gin Seco",
    body:
      "Una bevanda dalla personalità unica, con una deliziosa infusione di spezie tropicali, mediterranee e asiatiche.",
    key: "distillation",
    img: "/branding/drycatBianco.png",
  },
  {
    title: "London Dry",
    body:
      "Un gin traslucido e classico. Caratterizzato da una forte presenza di ginepro, con ingredienti tradizionali, è realizzato a partire da una distillazione tradizionale senza infusione di vegetali. Il risultato è un gin neutro, agrumato, rinfrescante e con note di erbe.",
    key: "botanicals",
    img: "/branding/drycatNero.png",
  },
  {
    title: "Gin Premium",
    body:
      "Realizzato con distillazione esclusiva e segreta. Una vera e propria alchimia sviluppata da foglie di mango, limone Tahiti e siciliano, prodotta al di fuori della fabbrica, in modo organico e sostenibile.",
    key: "design",
    img: "/branding/drycatVerde.png",
  },
  {
    title: "Gin Pink",
    body:
      "Una variazione della formula originale, questa bevanda è stata creata con una gradazione alcolica del 38% e una dolcezza ben caratteristica, proveniente dalla ciliegia e dall’ibisco.",
    key: "design2",
    img: "/branding/drycatPink.png",
  },
];

export default function FeatureCarousel({ speed = 30 }: { speed?: number }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const gapPxRef = useRef(24);

  const [repeat, setRepeat] = useState(6);
  const items = useMemo(
    () => Array.from({ length: repeat }).flatMap(() => FEATURES),
    [repeat]
  );

  useEffect(() => {
    const vp = viewportRef.current;
    const tr = trackRef.current;
    if (!vp || !tr) return;

    const compute = () => {
      const styles = getComputedStyle(tr);
      const gapStr = (styles.columnGap || styles.gap || "24px").toString();
      const gapVal = parseFloat(gapStr);
      gapPxRef.current = Number.isFinite(gapVal) ? gapVal : 24;

      const firstCard = tr.querySelector<HTMLElement>("[data-card]");
      if (!firstCard) return;

      const cardW = firstCard.getBoundingClientRect().width + gapPxRef.current;
      const vpW = vp.getBoundingClientRect().width;

      const minItems = Math.ceil((3 * vpW) / cardW);
      const needRepeats = Math.max(2, Math.ceil(minItems / FEATURES.length));
      setRepeat(needRepeats);
    };

    const id = requestAnimationFrame(compute);
    const ro = new ResizeObserver(compute);
    ro.observe(vp);
    ro.observe(tr);

    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const animate = (ts: number) => {
      if (pausedRef.current) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(animate);
        return;
      }
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const tr = trackRef.current;
      if (tr) {
        offsetRef.current -= speed * dt;

        let first = tr.firstElementChild as HTMLElement | null;
        while (first) {
          const w = first.getBoundingClientRect().width + gapPxRef.current;
          if (-offsetRef.current >= w) {
            offsetRef.current += w;
            tr.appendChild(first);
            first = tr.firstElementChild as HTMLElement | null;
          } else {
            break;
          }
        }

        tr.style.transform = `translateX(${offsetRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [speed, items.length]);

  const onEnter = () => (pausedRef.current = true);
  const onLeave = () => {
    pausedRef.current = false;
    lastTsRef.current = null;
  };

  return (
    <section className="relative w-full overflow-hidden py-6 md:py-8">
      <div
        ref={viewportRef}
        className="w-full overflow-visible"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onTouchStart={onEnter}
        onTouchEnd={onLeave}
      >
        <div
          ref={trackRef}
          className="flex items-stretch gap-6 will-change-transform overflow-visible"
        >
          {items.map((f, i) => (
            <div
              key={`${f.key}-${i}`}
              data-card
              className="flex-shrink-0 w-[300px]"
            >
              <div
                className="h-full flex flex-col cursor-pointer rounded-2xl border bg-card/80 backdrop-blur-sm shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl z-10 hover:z-20"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg md:text-xl font-semibold">{f.title}</h3>

                  <div className="my-4">
                    <Image
                      src={f.img}
                      alt={f.title}
                      width={300}
                      height={160}
                      className="w-full h-[160px] rounded-md object-cover"
                      priority
                    />
                  </div>

                  <p className="text-sm text-muted-foreground my-4">{f.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

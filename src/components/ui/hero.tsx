"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {useEffect, useState} from "react";

export default function Hero({ locale = "it" }: { locale?: string }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Mostra il contenuto dopo 1.5 secondi
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* 🔄 MOCK: Placeholder image - sarà sostituito con video */}
        <div className="relative w-full h-full">
          <Image
            src="/branding/drycat-bg-1.png"
            alt="Gin distillery background"
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* 🎥 VIDEO READY: Uncomment when video is available */}
        {/*
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/gin-distillery-poster.jpg"
        >
          <source src="/videos/gin-distillery.mp4" type="video/mp4" />
          <source src="/videos/gin-distillery.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        */}

        {/* Overlay scuro per migliorare la leggibilità del testo */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 60%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)",
            filter: "blur(14px)",
          }}
        />
      </div>

      {/* Contenuto centrato con animazione */}
      <div className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ease-out ${
        showContent
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight font-semibold leading-[1.04] font-[var(--font-display)] text-white">
          A modern classic.
          <br />
          <span className="opacity-90">Small-batch, ultra-refined gin.</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
          Distilled with precision and restraint. A monochrome statement for those who prefer quiet excellence.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="rounded-full px-8 py-3 text-base bg-white text-black hover:bg-white/90"
          >
            <a href={`/${locale}/shop`}>Shop DryCat</a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full px-8 py-3 text-base border-white/30 text-white hover:bg-white/10"
          >
            <a href={`/${locale}/about`}>Our story</a>
          </Button>
        </div>

        {/* Features highlights */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            Small-batch
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            Cold-filtered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            Curated botanicals
          </div>
        </div>
      </div>
    </section>
  );
}
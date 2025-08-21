"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";

const GIN_PRODUCTS = [
  {
    id: "pink",
    name: "Dolcezza caratteristica",
    image: "/branding/drycatPink.png",
    title: "Gin Pink",
    description:
      "Una variazione della formula originale, creata con una gradazione alcolica del 38% e una dolcezza caratteristica, proveniente da ciliegia e ibisco.",
    longDescription:
      "Colore e aroma sono le grandi stelle di questa alchimia di fiori e spezie, elaborata con grande cura per creare una bevanda dolce, leggera e rinfrescante.",
    specs: {
      method: "Tradizionale",
      alcohol: "38% vol.",
      expiry: "18 mesi (Gradazione colore)",
      style: "OldTom",
      volume: "700ml",
      ingredients:
        "ginepro, coriandolo, liquirizia, angelica, cardamomo, iride fiorentino, alloro, noce moscata, rosmarino, ibisco",
    },
  },
  {
    id: "seco",
    name: "Infusione tropicale",
    image: "/branding/gin-seco.jpg",
    title: "Gin Seco",
    description:
      "Una bevanda dalla personalità unica, con una deliziosa infusione di spezie tropicali, mediterranee e asiatiche.",
    longDescription:
      "Questa alchimia lo rende perfetto per il gin tonic o per la creazione della tua bevanda preferita. " +
      "Aroma di agrumi e leggera presenza di Aroeira (pepe rosa), una vera prelibatezza. " +
      "Elaborato con il metodo tradizionale dell’infusione, presenta freschezza, complessità ed equilibrio nella sua totalità sensoriale.",
    specs: {
      method: "Tradizionale, infusione",
      alcohol: "42% vol.",
      expiry: "Indeterminato",
      style: "London Dry",
      volume: "700ml",
      ingredients:
        "ginepro, coriandolo, angelica, limone, cardamomo, alloro, cannella, pepe rosa, noce moscata, rosmarino, anice stellato",
    },
  },
  {
    id: "premium",
    name: "Alchimia esclusiva",
    image: "/branding/gin-premium.jpg",
    title: "Gin Premium",
    description:
      "Realizzato con distillazione esclusiva e segreta, sviluppata da foglie di mango e limoni Tahiti e siciliani.",
    longDescription:
      "Un’esplosione di personalità e persistenza nel suo sapore, considerato il miglior gin mai prodotto da DryCat. " +
      "Leggermente piccante, con freschezza e intensità. " +
      "Versatile e complesso, presenta un aroma equilibrato con note agrumate, floreali e fruttate.",
    specs: {
      method: "Tradizionale",
      alcohol: "45% vol.",
      expiry: "Indeterminato",
      style: "London Dry",
      volume: "700ml",
      ingredients:
        "ginepro, coriandolo, angelica, cardamomo, alloro, liquirizia, rosmarino, giglio fiorentino, foglie di mango, limone Tahiti, limone siciliano",
    },
  },
  {
    id: "nero",
    name: "Bold Character",
    image: "/branding/london_dry.jpg",
    title: "London Dry",
    description: "Un gin traslucido e classico, con forte presenza di ginepro e ingredienti tradizionali.",
    longDescription:
      "Caratterizzato da una forte presenza di ginepro, con ingredienti tradizionali, è realizzato a partire da una distillazione tradizionale senza infusione di vegetali. " +
      "Il risultato è un gin neutro, agrumato, rinfrescante e con note di erbe.\n\n" +
      "È sorprendente ed equilibrato negli aromi e nei sapori, la base perfetta per le creazioni più diverse.\n\n" +
      "È stata eletta la più bella etichetta alcolica in Brasile, premio ABIEA 2019.",
    specs: {
      method: "Tradizionale, senza infusione",
      alcohol: "46% vol.",
      expiry: "Indeterminato",
      style: "London Dry",
      volume: "700ml",
      ingredients:
        "ginepro, coriandolo, angelica, cardamomo, alloro, noce moscata",
    },
  },
];

export default function ModernGinShowcase() {
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!api || paused) return;

    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 5000);

    return () => window.clearInterval(id);
  }, [api, paused]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  const handleEnter = () => setPaused(true);
  const handleLeave = () => setPaused(false);

  return (
    <section>
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">Esplora i nostri gin</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">Scopri l&apos;eccellenza della nostra distillazione artigianale</p>
      </div>

      <div
        className="relative px-4 sm:px-6 lg:px-8"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onTouchStart={handleEnter}
        onTouchEnd={handleLeave}
      >
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "start",
            loop: true
          }}
        >
          <CarouselContent>
            {GIN_PRODUCTS.map((gin) => (
              <CarouselItem key={gin.id} className="pb-4 pl-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center min-h-[480px] md:min-h-[520px] lg:min-h-[600px]">
                  {/* MOBILE/TABLET */}
                  <div className="lg:hidden col-span-1 space-y-3 md:space-y-4 px-2 flex flex-col">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground text-center">
                      {gin.title}
                    </h2>
                    <h3 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider text-center">
                      {gin.name}
                    </h3>

                    {/* Tablet */}
                    <p className="hidden md:block lg:hidden text-base text-foreground leading-relaxed text-center max-w-xl mx-auto">
                      {gin.description}
                    </p>
                  </div>

                  {/* IMAGE */}
                  <div className="relative col-span-1 flex justify-center">
                    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card w-full max-w-[420px] mx-auto">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={gin.image}
                          alt={gin.name}
                          fill
                          className="object-cover object-center transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
                          priority={current === GIN_PRODUCTS.findIndex(p => p.id === gin.id)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden lg:block col-span-1 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {gin.name}
                      </h3>
                      <h2 className="text-4xl font-semibold text-foreground">
                        {gin.title}
                      </h2>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                      <p className="text-lg text-foreground leading-relaxed">{gin.description}</p>
                      <p className="text-base text-muted-foreground leading-relaxed">{gin.longDescription}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Metodo</div>
                          <div className="text-sm text-foreground">{gin.specs.method}</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Gradazione</div>
                          <div className="text-sm text-foreground">{gin.specs.alcohol}</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Volume</div>
                          <div className="text-sm text-foreground">{gin.specs.volume}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Stile</div>
                          <div className="text-sm text-foreground">{gin.specs.style}</div>
                        </div>
                        <div className="rounded-xl border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Scadenza</div>
                          <div className="text-sm text-foreground">{gin.specs.expiry}</div>
                        </div>
                      </div>
                      <div className="space-y-3 col-span-2">
                        <div className="rounded-xl border border-border bg-card/30 p-4 hover:bg-card/50 transition-colors">
                          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ingredienti</div>
                          <div className="text-sm text-foreground leading-relaxed italic">{gin.specs.ingredients}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Nav */}
          <CarouselPrevious
            aria-label="Precedente"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="hidden lg:flex"

          />
          <CarouselNext
            aria-label="Successivo"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            className="hidden lg:flex"
          />
        </Carousel>
      </div>
    </section>
  );
}
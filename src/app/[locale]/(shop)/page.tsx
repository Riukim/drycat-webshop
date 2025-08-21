import SiteHeader from "@/components/ui/site-header";
import Hero from "@/components/ui/hero";
import GinShowcase from "@/components/ui/bottle-showcase";
import { useTranslations, useLocale } from 'next-intl';

export default function Home({ params }: { params: { locale: string } }) {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <main className="">
      <SiteHeader locale={locale}/>
          <Hero locale={locale}/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-16 md:space-y-24">
      {/*<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="h-px bg-border" /></div>*/}
      {/*<FeatureCards />*/}
          <div className="h-px bg-border" />

          <GinShowcase />
        </div>
      </div>
      <footer className="py-5 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} DryCat Distillers</p>
          <nav className="flex items-center gap-6">
            <a href={`/${locale}/privacy`} className="hover:text-foreground">Privacy</a>
            <a href={`/${locale}/terms`} className="hover:text-foreground">Terms</a>
            <a href={`/${locale}/contact`} className="hover:text-foreground">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

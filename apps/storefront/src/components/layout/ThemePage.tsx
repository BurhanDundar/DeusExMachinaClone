import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export type ThemePageContent = {
  slug: string;
  index: string;
  eyebrow: string;
  title: string;
  statement: string;
  introduction: string;
  accent: string;
  surface: string;
  heroImage: string;
  heroPosition?: string;
  detailImage: string;
  detailPosition?: string;
  sections: Array<{ number: string; title: string; body: string }>;
  quote: string;
};

const worlds = [
  { slug: "kahve", label: "Kahve", index: "01" },
  { slug: "dovme", label: "Dövme", index: "02" },
  { slug: "motor", label: "Motor", index: "03" },
];

export function ThemePage({ content }: { content: ThemePageContent }) {
  const pageStyle = {
    "--theme-accent": content.accent,
    "--theme-surface": content.surface,
  } as CSSProperties;

  return (
    <main style={pageStyle} className="bg-[var(--theme-surface)]">
      <article>
        <section className="shell pb-3 md:pb-4">
          <div className="relative min-h-[calc(100svh-100px)] overflow-hidden bg-black text-white">
            <Image
              src={content.heroImage}
              alt={`${content.title} dünyasından bir kare`}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: content.heroPosition ?? "center" }}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-black/5" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[11px] font-bold uppercase tracking-[.2em] md:p-10">
              <span>Binks Machina / {content.index}</span>
              <span className="hidden sm:inline">İstanbul — Türkiye</span>
            </div>
            <div className="absolute bottom-0 left-0 max-w-5xl p-6 md:p-12 lg:p-16">
              <p className="mb-4 text-xs font-bold uppercase tracking-[.24em] text-[var(--theme-accent)]">
                {content.eyebrow}
              </p>
              <h1 className="display text-[clamp(4.5rem,14vw,11rem)] leading-[.72] tracking-[-.07em]">
                {content.title}
              </h1>
              <p className="mt-8 max-w-xl text-base leading-7 text-white/80 md:text-lg">
                {content.statement}
              </p>
            </div>
            <ArrowDownRight className="absolute bottom-8 right-7 size-10 text-[var(--theme-accent)] md:bottom-12 md:right-12 md:size-14" />
          </div>
        </section>

        <section className="shell py-20 md:py-32">
          <div className="grid gap-12 border-t border-black/20 pt-8 lg:grid-cols-[1fr_2fr]">
            <p className="text-xs font-bold uppercase tracking-[.2em]">Manifesto / {content.index}</p>
            <p className="display max-w-5xl text-4xl leading-[.95] md:text-6xl lg:text-7xl">
              {content.introduction}
            </p>
          </div>
        </section>

        <section className="shell grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
          <figure className="relative min-h-[520px] overflow-hidden bg-black md:min-h-[760px]">
            <Image
              src={content.detailImage}
              alt={`${content.title} detay`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              style={{ objectPosition: content.detailPosition ?? "center" }}
              sizes="(max-width: 1023px) 100vw, 58vw"
            />
          </figure>
          <div className="flex flex-col justify-between bg-black p-7 text-white md:p-12 lg:p-14">
            <span className="display text-6xl text-[var(--theme-accent)]">“</span>
            <blockquote className="display my-20 text-4xl leading-none md:text-5xl">
              {content.quote}
            </blockquote>
            <span className="text-xs font-bold uppercase tracking-[.2em]">Binks Machina Culture</span>
          </div>
        </section>

        <section className="shell py-20 md:py-32">
          <div className="divide-y divide-black/20 border-y border-black/20">
            {content.sections.map((section) => (
              <section
                key={section.number}
                className="grid gap-5 py-10 md:grid-cols-[90px_1fr_1fr] md:gap-10 md:py-14"
              >
                <span className="text-sm font-bold text-black/45">{section.number}</span>
                <h2 className="display text-4xl md:text-5xl">{section.title}</h2>
                <p className="max-w-xl text-base leading-7 text-black/65">{section.body}</p>
              </section>
            ))}
          </div>
        </section>

        <nav className="shell pb-3 md:pb-4" aria-label="Binks dünyaları">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.2em]">Diğer dünyaları keşfet</p>
          <div className="grid border-l border-t border-black md:grid-cols-3">
            {worlds.map((world) => {
              const active = world.slug === content.slug;
              return (
                <Link
                  key={world.slug}
                  href={`/${world.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring group flex min-h-44 flex-col justify-between border-b border-r border-black p-6 transition-colors md:min-h-56 md:p-8 ${
                    active
                      ? "bg-black text-white"
                      : "hover:bg-[var(--theme-accent)] hover:text-black"
                  }`}
                >
                  <span className="flex items-center justify-between text-xs font-bold">
                    {world.index}
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="display text-4xl md:text-5xl">{world.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </article>
      <Footer />
    </main>
  );
}

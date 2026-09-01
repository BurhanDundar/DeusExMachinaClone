import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { articles } from "@/data/journal";

const galleryLayouts = [
  "col-span-2 aspect-[4/3] md:col-span-7",
  "col-span-1 aspect-square md:col-span-5",
  "col-span-1 aspect-[4/5] md:col-span-4",
  "col-span-1 aspect-[4/5] md:col-span-4",
  "col-span-1 aspect-[4/5] md:col-span-4",
  "col-span-2 aspect-[16/9] md:col-span-8 md:col-start-3",
] as const;

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: [article.image] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  const currentIndex = articles.findIndex((item) => item.slug === article.slug);
  const nextArticle = articles[(currentIndex + 1) % articles.length];
  const pageStyle = { "--story-accent": article.accent } as CSSProperties;

  return (
    <main style={pageStyle}>
      <article className="shell mx-auto max-w-[1600px]">
        <header className="py-8 md:py-12">
          <Link
            href="/journal"
            className="focus-ring inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em]"
          >
            <ArrowLeft size={16} /> Tüm hikâyeler
          </Link>

          <div className="mt-8 grid gap-3 md:grid-cols-12">
            <div className="flex flex-col justify-between bg-black p-7 text-white md:col-span-5 md:min-h-[520px] md:p-10 lg:p-12">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.22em] text-[var(--story-accent)]">
                  {article.theme}
                </p>
                <h1 className="display mt-5 text-6xl leading-[.82] tracking-[-.055em] md:text-7xl lg:text-8xl">
                  {article.title}
                </h1>
              </div>
              <div className="mt-16 border-t border-white/20 pt-6">
                <p className="display text-2xl leading-tight md:text-3xl">{article.cardDescription}</p>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/60">{article.excerpt}</p>
              </div>
            </div>

            <figure className="relative min-h-[420px] overflow-hidden bg-black md:col-span-7 md:min-h-[520px]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                className="object-cover"
                style={{ objectPosition: article.imagePosition }}
                sizes="(max-width: 767px) 100vw, 58vw"
              />
              <span className="absolute bottom-4 right-4 bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-white">
                Kapak / 00
              </span>
            </figure>
          </div>
        </header>

        <section className="border-t border-black/15 py-12 md:py-16" aria-label="Görsel günlük">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.2em] text-black/45">
                Görsel günlük
              </p>
              <h2 className="display mt-2 text-3xl md:text-4xl">Masadan, stüdyodan, yoldan.</h2>
            </div>
            <span className="text-xs font-bold text-black/40">01 — 06</span>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-12 md:gap-3">
            {article.gallery.map((galleryImage, index) => (
              <figure
                key={galleryImage.src}
                className={`group relative overflow-hidden bg-black ${galleryLayouts[index]}`}
              >
                <Image
                  src={galleryImage.src}
                  alt={galleryImage.alt}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.02]"
                  style={{ objectPosition: galleryImage.position ?? "center" }}
                  sizes="(max-width: 767px) 50vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-[.18em] text-white md:bottom-4 md:left-4">
                  0{index + 1}
                </span>
              </figure>
            ))}
          </div>
        </section>

        <section className="border-t border-black/15 py-12 md:py-16">
          <div className="grid gap-px border border-black/15 bg-black/15 md:grid-cols-3">
            {article.sections.map((section) => (
              <div key={section.number} className="bg-paper p-6 md:min-h-52 md:p-8">
                <span className="text-xs font-bold text-black/35">{section.number}</span>
                <h2 className="display mt-8 text-3xl">{section.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-black/60">{section.body}</p>
              </div>
            ))}
          </div>
        </section>

        {article.video ? (
          <section className="border-t border-black/15 py-12 md:py-16">
            <video
              controls
              playsInline
              preload="metadata"
              poster={article.video.poster}
              className="mx-auto aspect-video w-full max-w-5xl bg-black object-cover"
            >
              <source src={article.video.src} />
            </video>
            <p className="mx-auto mt-3 max-w-5xl text-sm text-black/55">
              {article.video.caption}
            </p>
          </section>
        ) : null}

        <blockquote className="display border-y border-black/15 py-12 text-4xl leading-none md:py-16 md:text-6xl">
          <span className="text-[var(--story-accent)]">“</span>
          {article.quote}
        </blockquote>

        <section className="py-3 md:py-4">
          <Link
            href={`/journal/${nextArticle.slug}`}
            className="focus-ring group flex min-h-40 items-end justify-between bg-[var(--story-accent)] p-6 md:min-h-48 md:p-9"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.2em]">Sıradaki hikâye</p>
              <h2 className="display mt-2 text-3xl md:text-5xl">{nextArticle.title}</h2>
            </div>
            <ArrowRight className="size-8 transition-transform group-hover:translate-x-2 md:size-10" />
          </Link>
        </section>
      </article>
      <Footer />
    </main>
  );
}

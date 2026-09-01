import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { articles } from "@/data/journal";
import { Footer } from "@/components/layout/Footer";

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
      <article>
        <header className="shell">
          <div className="relative min-h-[calc(100svh-96px)] overflow-hidden bg-black text-white">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              className="object-cover"
              style={{ objectPosition: article.imagePosition }}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/15" />
            <Link
              href="/journal"
              className="focus-ring absolute left-5 top-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] md:left-10 md:top-9"
            >
              <ArrowLeft size={17} /> Tüm hikâyeler
            </Link>
            <div className="absolute inset-x-0 bottom-0 max-w-5xl p-6 md:p-12 lg:p-16">
              <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--story-accent)]">
                {article.theme} · {article.date}
              </p>
              <h1 className="display mt-4 text-[clamp(4rem,11vw,9rem)] leading-[.78] tracking-[-.06em]">
                {article.title}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
                {article.excerpt}
              </p>
            </div>
          </div>
        </header>

        <section className="shell py-20 md:py-32">
          <div className="grid gap-10 border-t border-black/20 pt-8 md:grid-cols-[1fr_2fr]">
            <p className="text-xs font-bold uppercase tracking-[.2em]">Süreç günlüğü</p>
            <p className="display max-w-5xl text-4xl leading-[.98] md:text-6xl">{article.lead}</p>
          </div>
        </section>

        <section className="shell grid gap-2 md:grid-cols-2">
          {article.gallery.slice(0, 2).map((galleryImage, index) => (
            <figure
              key={galleryImage.src}
              className={`relative overflow-hidden bg-black ${
                index === 0 ? "aspect-[4/5]" : "aspect-[4/5] md:mt-24"
              }`}
            >
              <Image
                src={galleryImage.src}
                alt={galleryImage.alt}
                fill
                className="object-cover"
                style={{ objectPosition: galleryImage.position ?? "center" }}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </figure>
          ))}
        </section>

        <section className="shell py-20 md:py-32">
          <div className="divide-y divide-black/20 border-y border-black/20">
            {article.sections.map((section) => (
              <section
                key={section.number}
                className="grid gap-5 py-10 md:grid-cols-[90px_1fr_1fr] md:gap-10 md:py-14"
              >
                <span className="text-sm font-bold text-black/40">{section.number}</span>
                <h2 className="display text-4xl md:text-5xl">{section.title}</h2>
                <p className="max-w-xl text-base leading-7 text-black/65">{section.body}</p>
              </section>
            ))}
          </div>
        </section>

        {article.video ? (
          <section className="shell pb-3 md:pb-4">
            <video
              controls
              playsInline
              preload="metadata"
              poster={article.video.poster}
              className="aspect-video w-full bg-black object-cover"
            >
              <source src={article.video.src} />
            </video>
            <p className="mt-3 text-sm text-black/55">{article.video.caption}</p>
          </section>
        ) : null}

        <section className="shell grid gap-2 pb-20 md:grid-cols-[1.2fr_.8fr] md:pb-32">
          <figure className="relative aspect-[16/10] overflow-hidden bg-black">
            <Image
              src={article.gallery[2].src}
              alt={article.gallery[2].alt}
              fill
              className="object-cover"
              style={{ objectPosition: article.gallery[2].position ?? "center" }}
              sizes="(max-width: 767px) 100vw, 60vw"
            />
          </figure>
          <blockquote className="display flex min-h-80 items-center bg-black p-8 text-4xl leading-none text-white md:p-12 md:text-5xl">
            <span>
              <span className="text-[var(--story-accent)]">“</span>
              {article.quote}
            </span>
          </blockquote>
        </section>

        <section className="shell pb-3 md:pb-4">
          <Link
            href={`/journal/${nextArticle.slug}`}
            className="focus-ring group flex min-h-56 items-end justify-between bg-[var(--story-accent)] p-7 md:min-h-72 md:p-12"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em]">Sıradaki hikâye</p>
              <h2 className="display mt-3 text-4xl md:text-6xl">{nextArticle.title}</h2>
            </div>
            <ArrowRight className="size-9 transition-transform group-hover:translate-x-2 md:size-12" />
          </Link>
        </section>
      </article>
      <Footer />
    </main>
  );
}

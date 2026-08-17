import type { ReactNode } from "react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

type InformationSection = {
  title: string;
  content: ReactNode;
};

export function InformationPage({
  eyebrow,
  title,
  introduction,
  sections,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: InformationSection[];
}) {
  return (
    <main>
      <article className="shell mx-auto max-w-4xl py-16 md:py-24">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-black/55">{eyebrow}</p>
        <h1 className="display mt-5 text-5xl md:text-7xl">{title}</h1>
        <p className="mt-7 max-w-2xl text-base leading-7 text-black/70">{introduction}</p>
        <div className="mt-14 divide-y divide-black/15 border-y border-black/15">
          {sections.map((section) => (
            <section
              key={section.title}
              className="grid gap-4 py-8 md:grid-cols-[220px_1fr] md:gap-10"
            >
              <h2 className="display text-2xl">{section.title}</h2>
              <div className="space-y-4 leading-7 text-black/75">{section.content}</div>
            </section>
          ))}
        </div>
        <p className="mt-10 text-sm text-black/60">
          Sorunuz mu var?{" "}
          <Link href="/contact" className="focus-ring font-bold underline">
            İletişim sayfasından bize ulaşın.
          </Link>
        </p>
      </article>
      <Footer />
    </main>
  );
}

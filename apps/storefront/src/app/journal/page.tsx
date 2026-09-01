import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/journal";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Yoldan Hikâyeler",
  description: "Kahve, dövme ve motor kültürünün arkasındaki Binks Machina hikâyeleri.",
};

export default function Journal() {
  return (
    <main>
      <section className="shell py-12">
        <h1 className="display mb-12 text-6xl">Yoldan Hikâyeler</h1>
        <div className="grid gap-12 md:grid-cols-3">
          {articles.map((a) => (
            <article key={a.slug}>
              <Link
                href={`/journal/${a.slug}`}
                className="relative block aspect-[4/5] overflow-hidden"
              >
                <Image
                  src={a.image}
                  alt={a.title}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.02]"
                  style={{ objectPosition: a.imagePosition }}
                  sizes="(max-width: 767px) 100vw, 33vw"
                />
              </Link>
              <p className="mt-5 text-xs">{a.date}</p>
              <h2 className="display mt-2 text-3xl">{a.title}</h2>
              <p className="mt-3 text-black/60">{a.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

import { notFound } from "next/navigation";
import Image from "next/image";
import { articles } from "@/data/journal";
import { Footer } from "@/components/layout/Footer";
export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <main>
      <article>
        <div className="shell relative aspect-[4/5] md:aspect-[16/7]">
          <Image src={a.image} alt="" fill className="object-cover" priority />
        </div>
        <div className="mx-auto max-w-3xl px-5 py-16">
          <p>{a.date}</p>
          <h1 className="display mt-4 text-5xl md:text-7xl">{a.title}</h1>
          <p className="mt-8 text-xl leading-8">
            {a.excerpt} This fictional editorial follows patient craft, useful objects, and the
            people who find a better line through the everyday.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles } from "@/data/journal";

export function EditorialGrid() {
  return (
    <section className="shell section-space">
      <div className="mb-10 flex justify-between">
        <h2 className="display text-3xl md:text-4xl">Yoldan hikâyeler</h2>
        <Link href="/journal" className="focus-ring flex items-center gap-2 font-bold">
          <ArrowRight /> Tümünü oku
        </Link>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {articles.map((article) => (
          <Link
            href={`/journal/${article.slug}`}
            key={article.slug}
            className="focus-ring group relative aspect-[3/4] overflow-hidden"
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.015]"
              style={{ objectPosition: article.imagePosition }}
              sizes="(max-width:767px) 100vw,33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-7">
              <h3 className="display text-4xl leading-none md:text-5xl">{article.title}</h3>
              <p className="mt-3 max-w-sm text-xs font-semibold leading-5 text-white/70 md:text-sm">
                {article.cardDescription}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

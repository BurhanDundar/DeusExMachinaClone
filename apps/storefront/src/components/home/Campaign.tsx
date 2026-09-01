import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TypingText } from "@/components/home/TypingText";
export function Campaign({
  image,
  title,
  kicker,
  portrait = false,
  position,
  typing = false,
}: {
  image: string;
  title: string;
  kicker?: string;
  portrait?: boolean;
  position?: string;
  typing?: boolean;
}) {
  return (
    <section className="shell">
      <Link
        href="/collections/new-arrivals"
        className={`focus-ring group relative block overflow-hidden ${portrait ? "aspect-[4/5] md:aspect-[16/7]" : "aspect-[4/5] md:aspect-video"}`}
      >
        <Image
          src={image}
          alt=""
          fill
          priority={!portrait}
          className="object-cover transition duration-700 group-hover:scale-[1.015]"
          style={{ objectPosition: position ?? (!portrait ? "center 18%" : "center") }}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
        <div className="absolute bottom-7 left-6 text-white md:bottom-12 md:left-12">
          {kicker ? (
            <p className="mb-3 text-sm font-bold uppercase tracking-[.18em]">{kicker}</p>
          ) : null}
          <h1 className="display max-w-2xl text-4xl md:text-6xl">
            {typing ? <TypingText text={title} /> : title}
          </h1>
          <span className="mt-5 flex items-center gap-2 text-lg font-bold">
            <ArrowRight /> Şimdi keşfet
          </span>
        </div>
      </Link>
    </section>
  );
}

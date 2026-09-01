import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cultureMedia } from "@/data/culture-media";

const worlds = [
  {
    title: "Kahve",
    subtitle: "Günlük ritüel",
    href: "/kahve",
    image: cultureMedia.kahve.pourOver,
    position: "center",
  },
  {
    title: "Dövme",
    subtitle: "Kalıcı ifade",
    href: "/dovme",
    image: cultureMedia.dovme.session,
    position: "center",
  },
  {
    title: "Motor",
    subtitle: "Yolda olma hâli",
    href: "/motor",
    image: cultureMedia.motor.road,
    position: "center 58%",
  },
] as const;

export function CultureWorlds() {
  return (
    <section className="shell pb-3 md:pb-4" aria-label="Kahve, dövme ve motor dünyaları">
      <div className="no-scrollbar -mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {worlds.map((world, index) => (
          <Link
            key={world.href}
            href={world.href}
            className="focus-ring group relative block aspect-[4/5] w-[82vw] shrink-0 snap-center overflow-hidden bg-black text-white md:w-auto"
          >
            <Image
              src={world.image}
              alt={`${world.title} dünyasını keşfet`}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
              style={{ objectPosition: world.position }}
              sizes="(max-width: 767px) 82vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10 transition-colors group-hover:from-black/85" />
            <span className="absolute left-5 top-5 text-[11px] font-bold tracking-[.18em] text-white/75 md:left-7 md:top-7">
              0{index + 1}
            </span>
            <ArrowUpRight className="absolute right-5 top-5 size-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:right-7 md:top-7" />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-white/65">
                {world.subtitle}
              </p>
              <h3 className="display text-4xl md:text-5xl">{world.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

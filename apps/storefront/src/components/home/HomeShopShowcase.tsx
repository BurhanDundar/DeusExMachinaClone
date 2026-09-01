"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { cultureMedia } from "@/data/culture-media";

const stories = [
  {
    image: "/products/binks/gomlek-komur-ekose.jpeg",
    label: "Kömür Ekose İş Gömleği",
    href: "/products/komur-ekose-is-gomlegi",
  },
  {
    image: "/products/binks/tisort-mekanik-sanat.jpeg",
    label: "Mekanik Sanat Tişörtü",
    href: "/products/mekanik-sanat-tisortu",
  },
  {
    image: "/products/binks/bandana-paisley-koleksiyonu.jpeg",
    label: "Kırmızı Paisley Bandana",
    href: "/products/kirmizi-paisley-bandana",
  },
  {
    image: "/products/binks/sapka-motor-nakis.jpeg",
    label: "Motor Nakışlı Şapka",
    href: "/products/motor-nakisli-sapka",
  },
  {
    image: "/products/binks/defter-mekanik-sanat.jpeg",
    label: "Mekanik Sanat Defteri",
    href: "/products/mekanik-sanat-defteri",
  },
  {
    image: "/products/binks/anahtarlik-binks.jpeg",
    label: "Binks Anahtarlık",
    href: "/products/binks-anahtarlik",
  },
] as const;

export function HomeShopShowcase() {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef({ pointerId: -1, startX: 0, startScrollLeft: 0, moved: false });
  const suppressClickUntil = useRef(0);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.current.startX;
    if (Math.abs(distance) > 5) drag.current.moved = true;
    if (!drag.current.moved) return;

    event.preventDefault();
    event.currentTarget.scrollLeft = drag.current.startScrollLeft - distance;
  }

  function finishDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current.pointerId !== event.pointerId) return;

    if (drag.current.moved) suppressClickUntil.current = Date.now() + 150;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    drag.current.pointerId = -1;
  }

  return (
    <div className="pb-3 md:pb-4">
      <section className="shell" aria-labelledby="shop-stories-title">
        <header className="mb-6 flex items-end justify-between gap-5 md:mb-8">
          <div>
            {/* Kaldırıp hizalama yapılabilir */}
            <h2 id="shop-stories-title" className="display text-3xl md:text-5xl"></h2>
          </div>
          <div className="flex items-center">
            <Link
              href="/products"
              className="focus-ring flex min-h-10 items-center gap-2 px-2 text-sm font-bold md:px-4"
            >
              Tüm ürünleri gör <ArrowUpRight size={18} />
            </Link>
          </div>
        </header>

        <div
          ref={rail}
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onClickCapture={(event) => {
            if (Date.now() >= suppressClickUntil.current) return;
            event.preventDefault();
            event.stopPropagation();
          }}
          className="no-scrollbar flex cursor-grab snap-x snap-mandatory select-none gap-2 overflow-x-auto overscroll-x-contain touch-pan-y active:cursor-grabbing md:gap-3"
          aria-label="Ürün seçkisi"
        >
          {stories.map((story) => (
            <Link
              key={story.href}
              href={story.href}
              draggable={false}
              className="focus-ring group relative aspect-[4/5] w-[72vw] max-w-[430px] shrink-0 snap-start overflow-hidden bg-black sm:w-[46vw] lg:w-[calc((100vw-68px)/4)]"
            >
              <Image
                src={story.image}
                alt={story.label}
                fill
                draggable={false}
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                sizes="(max-width: 639px) 72vw, (max-width: 1023px) 46vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
              <span className="display absolute inset-x-0 bottom-0 translate-y-2 p-5 text-2xl text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:p-7 md:text-3xl">
                {story.label}
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-black/45 sm:hidden">
          Görselleri kaydırarak keşfet →
        </p>
      </section>

      <section className="shell mt-3 md:mt-4">
        <Link
          href="/collections/new-arrivals"
          className="focus-ring group relative block aspect-[3/4] overflow-hidden bg-black text-white md:aspect-video"
        >
          <Image
            src={cultureMedia.motor.portrait}
            alt="Binks Machina yeni sezon"
            fill
            className="object-cover object-center grayscale transition duration-1000 group-hover:scale-[1.015] group-hover:grayscale-0"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-7 text-center md:p-14">
            <h2 className="display mt-3 text-5xl md:text-7xl">Rüzgarı hisset.</h2>
            <span className="mt-6 flex items-center gap-2 border-b border-white pb-1 text-sm font-bold">
              Ön gösterimi keşfet <ArrowRight size={18} />
            </span>
          </div>
        </Link>
      </section>
    </div>
  );
}

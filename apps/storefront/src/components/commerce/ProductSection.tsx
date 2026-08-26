"use client";

import { motion, useAnimationControls, useDragControls, type PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

export function ProductSection({
  title,
  products,
  anchor,
  href,
}: {
  title: string;
  products: Product[];
  anchor?: string;
  href: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const suppressProductClick = useRef(false);
  const clickResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controls = useAnimationControls();
  const dragControls = useDragControls();
  const [cardsPerPage, setCardsPerPage] = useState(2);
  const [activePage, setActivePage] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const pageCount = Math.ceil(products.length / cardsPerPage);
  const pages = useMemo(
    () =>
      Array.from({ length: pageCount }, (_, index) =>
        products.slice(index * cardsPerPage, (index + 1) * cardsPerPage)
      ),
    [cardsPerPage, pageCount, products]
  );

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const updatePageSize = () => setCardsPerPage(query.matches ? 4 : 2);
    updatePageSize();
    query.addEventListener("change", updatePageSize);

    return () => query.removeEventListener("change", updatePageSize);
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;

    const updateViewportWidth = () => setViewportWidth(element.clientWidth);
    updateViewportWidth();

    const observer = new ResizeObserver(updateViewportWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActivePage((currentPage) => Math.min(currentPage, pageCount - 1));
  }, [pageCount]);

  useEffect(() => {
    controls.set({ x: -activePage * viewportWidth });
  }, [controls, viewportWidth]);

  useEffect(() => {
    return () => {
      if (clickResetTimer.current) clearTimeout(clickResetTimer.current);
    };
  }, []);

  function markDragStarted() {
    if (clickResetTimer.current) clearTimeout(clickResetTimer.current);
    suppressProductClick.current = true;
  }

  function allowFutureProductClicks() {
    clickResetTimer.current = setTimeout(() => {
      suppressProductClick.current = false;
    }, 0);
  }

  function snapToPage(page: number) {
    const nextPage = Math.max(0, Math.min(pageCount - 1, page));
    setActivePage(nextPage);
    controls.start({
      x: -nextPage * viewportWidth,
      transition: {
        duration: 0.46,
        ease: [0.32, 0.72, 0, 1],
      },
    });
  }

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const dragDistance = Math.abs(info.offset.x);
    if (dragDistance >= 8) allowFutureProductClicks();
    else suppressProductClick.current = false;

    const threshold = Math.max(42, viewportWidth * 0.12);
    const movedFarEnough = dragDistance >= threshold;
    const movedFastEnough = Math.abs(info.velocity.x) >= 550;

    if (!movedFarEnough && !movedFastEnough) {
      snapToPage(activePage);
      return;
    }

    snapToPage(activePage + (info.offset.x < 0 ? 1 : -1));
  }

  return (
    <section id={anchor} className="section-space shell">
      <div className="mb-10 flex items-end justify-between md:mb-16">
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
        <Link href={href} className="focus-ring flex items-center gap-2 font-bold">
          <ArrowRight /> Tümünü gör
        </Link>
      </div>
      <div ref={viewport} className="overflow-hidden touch-pan-y" aria-label={`${title} ürünleri`}>
        <span className="sr-only">Ürünlere göz atmak için kaydırın veya sürükleyin</span>
        <motion.div
          animate={controls}
          className="flex cursor-grab select-none active:cursor-grabbing"
          drag={pageCount > 1 ? "x" : false}
          dragControls={dragControls}
          dragElastic={0.08}
          dragListener={false}
          dragMomentum={false}
          onClickCapture={(event) => {
            if (!suppressProductClick.current) return;

            event.preventDefault();
            event.stopPropagation();
            suppressProductClick.current = false;
          }}
          onDragEnd={handleDragEnd}
          onDragStart={markDragStarted}
          onPointerDown={(event) => {
            if (pageCount > 1) dragControls.start(event, { distanceThreshold: 8 });
          }}
        >
          {pages.map((page, pageIndex) => (
            <div className="min-w-0 shrink-0 grow-0 basis-full" key={pageIndex}>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                {page.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      {pageCount > 1 && (
        <div
          className="mt-5 md:hidden"
          aria-label={`${pageCount} sayfadan ${activePage + 1}. sayfa`}
        >
          <div className="h-[2px] bg-black/15">
            <div
              className="h-full bg-black transition-[width] duration-200"
              style={{ width: `${((activePage + 1) / pageCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

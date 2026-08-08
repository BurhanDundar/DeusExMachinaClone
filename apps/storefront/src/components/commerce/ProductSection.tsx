import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";
export function ProductSection({
  title,
  products,
  anchor,
}: {
  title: string;
  products: Product[];
  anchor?: string;
}) {
  return (
    <section id={anchor} className="section-space shell">
      <div className="mb-10 flex items-end justify-between md:mb-16">
        <h2 className="display text-3xl md:text-4xl">{title}</h2>
        <Link
          href={`/collections/${title.toLowerCase().replaceAll(" ", "-")}`}
          className="focus-ring flex items-center gap-2 font-bold"
        >
          <ArrowRight /> Shop all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-12 md:grid-cols-4 md:gap-x-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-10 h-[3px] bg-black/15">
        <div className="h-full w-1/4 bg-black" />
      </div>
    </section>
  );
}

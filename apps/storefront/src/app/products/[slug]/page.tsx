import Image from "next/image";
import { notFound } from "next/navigation";
import { products, productBySlug } from "@/data/products";
import { ProductSection } from "@/components/commerce/ProductSection";
import { ProductPurchase } from "./purchase";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/currency";
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) notFound();
  return (
    <main>
      <div className="shell grid gap-8 py-8 md:grid-cols-2 md:py-14">
        <div className="grid gap-2 md:grid-cols-2">
          {[...p.images, ...p.images].map((src, i) => (
            <div className="relative aspect-[4/5] bg-fog" key={i}>
              <Image
                src={src}
                alt={i === 0 ? p.name : ""}
                fill
                className="object-cover"
                sizes="(max-width:767px) 100vw,25vw"
              />
            </div>
          ))}
        </div>
        <div className="md:sticky md:top-32 md:h-fit md:px-14">
          <p className="text-xs font-bold">{p.badge}</p>
          <h1 className="display mt-4 text-4xl md:text-5xl">{p.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(p.price)}</p>
          <p className="mt-8 max-w-md leading-6 text-black/65">{p.description}</p>
          <ProductPurchase product={p} />
          <details className="mt-10 border-t border-black py-5">
            <summary className="cursor-pointer font-bold">Details & care</summary>
            <p className="pt-4 text-black/60">
              Mid-weight fabric. Relaxed fit. Wash cool and line dry.
            </p>
          </details>
          <details className="border-y border-black py-5">
            <summary className="cursor-pointer font-bold">Shipping & returns</summary>
            <p className="pt-4 text-black/60">Complimentary returns within 30 days.</p>
          </details>
        </div>
      </div>
      <ProductSection title="Related products" products={products.slice(4, 8)} />
      <Footer />
    </main>
  );
}

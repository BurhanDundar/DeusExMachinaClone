import Image from "next/image";
import { notFound } from "next/navigation";
import { getProducts, productBySlug } from "@/data/products";
import { ProductSection } from "@/components/commerce/ProductSection";
import { ProductPurchase } from "./purchase";
import { Footer } from "@/components/layout/Footer";
import { formatPrice } from "@/lib/currency";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await productBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, products] = await Promise.all([productBySlug(slug), getProducts()]);
  if (!p) notFound();
  return (
    <main>
      <div className="shell grid gap-8 py-8 md:grid-cols-2 md:py-14">
        <div className="grid gap-2 md:grid-cols-2">
          {p.images.map((src, i) => (
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
            <summary className="cursor-pointer font-bold">Ürün detayları ve bakım</summary>
            <p className="pt-4 text-black/60">
              Orta kalınlıkta kumaş. Rahat kalıp. Düşük sıcaklıkta yıkayın ve asarak kurutun.
            </p>
          </details>
          <details className="border-y border-black py-5">
            <summary className="cursor-pointer font-bold">Kargo ve iade</summary>
            <p className="pt-4 text-black/60">
              Teslimden itibaren 14 gün içinde iade talebi oluşturabilirsiniz.
            </p>
          </details>
        </div>
      </div>
      <ProductSection
        title="Benzer ürünler"
        products={products.filter((product) => product.slug !== p.slug).slice(0, 8)}
        href={`/collections/${p.categorySlug === "giyim" ? "clothing" : p.categorySlug === "aksesuar" ? "accessories" : p.categorySlug === "defterler" ? "culture" : p.categorySlug}`}
      />
      <Footer />
    </main>
  );
}

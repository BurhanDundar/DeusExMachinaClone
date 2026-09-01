import type { Metadata } from "next";
import { connection } from "next/server";
import { CollectionProducts } from "@/components/commerce/CollectionProducts";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Tüm Ürünler",
  description: "Binks Machina koleksiyonundaki tüm ürünleri keşfedin.",
};

export default async function AllProductsPage() {
  await connection();
  const products = await getProducts();

  return (
    <main>
      <section className="shell pb-20 pt-10 md:pb-28 md:pt-16">
        <header className="mb-9 border-b border-black/15 pb-8 md:mb-12 md:pb-11">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-black/50">
            Binks Machina · {products.length} ürün
          </p>
          <h1 className="display mt-3 max-w-5xl text-5xl leading-[.95] md:text-7xl">
            Tüm Ürünler
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-black/60 md:text-base">
            Atölye giyiminden aksesuarlara, defterlerden özel parçalara kadar tüm koleksiyonu
            filtreleyerek keşfet.
          </p>
        </header>
        <CollectionProducts products={products} />
      </section>
      <Footer />
    </main>
  );
}

import { getProducts } from "@/data/products";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Footer } from "@/components/layout/Footer";
export const dynamic = "force-dynamic";

const collectionAliases: Record<string, string | undefined> = {
  men: "giyim",
  women: "giyim",
  accessories: "aksesuar",
  culture: "defterler",
};

const collectionTitles: Record<string, string | undefined> = {
  men: "Erkek",
  women: "Kadın",
  accessories: "Aksesuarlar",
  culture: "Kültür",
  sale: "İndirim",
};

export default async function Collection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const categorySlug = collectionAliases[slug] ?? slug;
  const collectionProducts =
    slug === "sale"
      ? products.filter((product) => product.originalPrice)
      : products.filter((product) => product.categorySlug === categorySlug);
  const title =
    collectionTitles[slug] ??
    slug
      .split("-")
      .map((x) => x[0]?.toUpperCase() + x.slice(1))
      .join(" ");
  return (
    <main>
      <section className="shell pb-20 pt-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm text-black/50">Koleksiyon / {collectionProducts.length} ürün</p>
            <h1 className="display mt-2 text-5xl md:text-7xl">{title}</h1>
          </div>
          <div className="flex gap-2">
            <button className="border border-black px-5 py-3">Filtrele ＋</button>
            <button className="border border-black px-5 py-3">Sırala ↓</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-12 md:grid-cols-4 md:gap-x-3">
          {collectionProducts.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

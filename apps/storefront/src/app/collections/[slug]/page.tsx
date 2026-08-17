import { getProducts } from "@/data/products";
import { CollectionProducts } from "@/components/commerce/CollectionProducts";
import { Footer } from "@/components/layout/Footer";
export const dynamic = "force-dynamic";

type CollectionKey =
  "clothing" | "accessories" | "culture" | "sale" | "new-arrivals" | "accessories-notebooks";

const collectionAliases: Record<string, CollectionKey> = {
  clothing: "clothing",
  giyim: "clothing",
  "atolye-giyimi": "clothing",
  men: "clothing",
  erkek: "clothing",
  women: "clothing",
  woman: "clothing",
  kadin: "clothing",
  accessories: "accessories",
  aksesuar: "accessories",
  aksesuarlar: "accessories",
  culture: "culture",
  kultur: "culture",
  defterler: "culture",
  sale: "sale",
  indirim: "sale",
  "new-arrivals": "new-arrivals",
  "yeni-gelenler": "new-arrivals",
  "accessories-notebooks": "accessories-notebooks",
  "aksesuarlar-ve-defterler": "accessories-notebooks",
};

const collectionTitles: Record<CollectionKey, string> = {
  clothing: "Atölye Giyimi",
  accessories: "Aksesuarlar",
  culture: "Kültür ve Defterler",
  sale: "İndirim",
  "new-arrivals": "Yeni Gelenler",
  "accessories-notebooks": "Aksesuarlar ve Defterler",
};

export default async function Collection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: routeSlug } = await params;
  const normalizedSlug = normalizeSlug(routeSlug);
  const collectionKey = collectionAliases[normalizedSlug];
  const products = await getProducts();
  const collectionProducts = collectionKey
    ? (() => {
        if (collectionKey === "sale") return products.filter((product) => product.originalPrice);
        if (collectionKey === "new-arrivals") {
          return products.filter((product) => product.featured);
        }
        if (collectionKey === "accessories-notebooks") {
          return products.filter((product) =>
            ["aksesuar", "defterler"].includes(normalizeSlug(product.categorySlug))
          );
        }
        const categoryByCollection: Record<
          Exclude<CollectionKey, "sale" | "new-arrivals" | "accessories-notebooks">,
          string
        > = {
          clothing: "giyim",
          accessories: "aksesuar",
          culture: "defterler",
        };
        const categorySlug = categoryByCollection[collectionKey];
        return products.filter((product) => normalizeSlug(product.categorySlug) === categorySlug);
      })()
    : products.filter((product) => normalizeSlug(product.categorySlug) === normalizedSlug);
  const title = collectionKey ? collectionTitles[collectionKey] : humanizeSlug(normalizedSlug);

  return (
    <main>
      <section className="shell pb-20 pt-10 md:pb-28 md:pt-16">
        <header className="mb-9 border-b border-black/15 pb-8 md:mb-12 md:pb-11">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/50">
            Koleksiyon · {collectionProducts.length} ürün
          </p>
          <h1 className="display mt-3 max-w-5xl text-5xl leading-[0.95] md:text-7xl">{title}</h1>
        </header>
        <CollectionProducts products={collectionProducts} />
      </section>
      <Footer />
    </main>
  );
}

function normalizeSlug(value: string) {
  let decoded = value;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const nextValue = decodeURIComponent(decoded);
      if (nextValue === decoded) break;
      decoded = nextValue;
    } catch {
      break;
    }
  }

  return decoded
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeSlug(slug: string) {
  if (!slug) return "Ürünler";

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word[0]?.toLocaleUpperCase("tr-TR") + word.slice(1))
    .join(" ");
}

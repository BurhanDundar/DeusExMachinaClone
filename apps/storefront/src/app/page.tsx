import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Campaign } from "@/components/home/Campaign";
import { CultureWorlds } from "@/components/home/CultureWorlds";
import { HomeShopShowcase } from "@/components/home/HomeShopShowcase";
import { ProductSection } from "@/components/commerce/ProductSection";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/data/products";

export default async function Home() {
  // Render the catalog when a request arrives so deployments do not depend on
  // the external commerce API being awake during `next build`.
  await connection();
  const products = await getProducts();
  const featuredProducts = products.filter((product) => product.featured);
  const clothing = products.filter((product) => product.categorySlug === "giyim");
  const accessories = products.filter((product) => product.categorySlug === "aksesuar");
  const notebooks = products.filter((product) => product.categorySlug === "defterler");
  return (
    <main>
      <Campaign
        image="/campaign/campaign-portrait.jpg"
        kicker="Sonbahar / Kış 26"
        title="Uzun yollar için tasarlandı."
      />
      <ProductSection
        title="Yeni Gelenler"
        products={featuredProducts}
        href="/collections/new-arrivals"
      />
      <HomeShopShowcase />
      <CultureWorlds />
      <Campaign
        image="/campaign/campaign-wide.jpg"
        kicker="Hareket çalışmaları / 01"
        title="Şehir sınırları yalnızca bir öneridir."
        portrait
      />
      <ProductSection title="Atölye Giyimi" products={clothing} href="/collections/clothing" />
      <section className="shell">
        <div className="grid gap-2 md:grid-cols-2">
          <CampaignTile image="/campaign/campaign-portrait.jpg" title="Giyim" slug="clothing" />
          <CampaignTile
            image="/campaign/campaign-wide.jpg"
            title="Aksesuarlar"
            slug="accessories"
          />
        </div>
      </section>
      <ProductSection
        title="Aksesuarlar ve Defterler"
        products={[...accessories, ...notebooks]}
        href="/collections/accessories-notebooks"
      />
      <EditorialGrid />
      <Footer />
    </main>
  );
}
function CampaignTile({ image, title, slug }: { image: string; title: string; slug: string }) {
  return (
    <Link
      href={`/collections/${slug}`}
      className="group relative block aspect-[4/5] overflow-hidden bg-black"
    >
      <Image
        src={image}
        alt=""
        fill
        className="object-cover transition duration-700 group-hover:scale-[1.02]"
        sizes="(max-width:767px) 100vw,50vw"
      />
      <span className="display absolute bottom-6 left-6 text-4xl text-white">{title} →</span>
    </Link>
  );
}

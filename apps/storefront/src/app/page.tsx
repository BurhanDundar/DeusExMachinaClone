import Image from "next/image";
import { Campaign } from "@/components/home/Campaign";
import { ProductSection } from "@/components/commerce/ProductSection";
import { EditorialGrid } from "@/components/home/EditorialGrid";
import { Footer } from "@/components/layout/Footer";
import { getProducts } from "@/data/products";

export const dynamic = "force-dynamic";

export default async function Home() {
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
      <ProductSection title="Yeni Gelenler" products={featuredProducts} />
      <Campaign
        image="/campaign/campaign-wide.jpg"
        kicker="Hareket çalışmaları / 01"
        title="Şehir sınırları yalnızca bir öneridir."
        portrait
      />
      <ProductSection title="Atölye Giyimi" products={clothing} />
      <section className="shell">
        <div className="grid gap-2 md:grid-cols-2">
          <CampaignTile image="/campaign/campaign-portrait.jpg" title="Erkek" slug="men" />
          <CampaignTile image="/campaign/campaign-wide.jpg" title="Kadın" slug="women" />
        </div>
      </section>
      <ProductSection title="Aksesuarlar ve Defterler" products={[...accessories, ...notebooks]} />
      <EditorialGrid />
      <Footer />
    </main>
  );
}
function CampaignTile({ image, title, slug }: { image: string; title: string; slug: string }) {
  return (
    <a
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
    </a>
  );
}

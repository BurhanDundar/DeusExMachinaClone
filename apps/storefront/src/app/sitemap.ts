import type { MetadataRoute } from "next";
import { getProducts } from "@/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = [
    "",
    "/products",
    "/about",
    "/kahve",
    "/dovme",
    "/motor",
    "/contact",
    "/journal",
    "/collections/new-arrivals",
    "/collections/clothing",
    "/collections/accessories",
    "/collections/culture",
    "/collections/sale",
    "/shipping",
    "/returns",
    "/size-guide",
    "/privacy",
    "/terms",
    "/distance-sales",
  ];
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    productRoutes = products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // Statik sayfaların site haritası, katalog geçici olarak kapalıyken de üretilebilir.
  }
  return [
    ...routes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? ("daily" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.6,
    })),
    ...productRoutes,
  ];
}

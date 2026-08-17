"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fallbackProducts } from "@/data/products";
import { apiRequest } from "@/lib/api";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/currency";

type SearchProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  categoryName: string;
};

type CatalogSearchProduct = Omit<SearchProduct, "categoryName"> & {
  category: { name: string };
};

const fallbackSearchProducts: SearchProduct[] = fallbackProducts.map((product) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  categoryName: product.category,
}));

function toSearchProducts(products: CatalogSearchProduct[]): SearchProduct[] {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    categoryName: product.category.name,
  }));
}

export function SearchDrawer() {
  const s = useUIStore();
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!s.searchOpen) return;

    const controller = new AbortController();
    setLoadingProducts(true);
    apiRequest<CatalogSearchProduct[]>("/api/products", { signal: controller.signal })
      .then((catalog) => {
        if (!controller.signal.aborted) {
          setProducts(catalog.length ? toSearchProducts(catalog) : fallbackSearchProducts);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Catalog search could not load", error);
          setProducts(fallbackSearchProducts);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingProducts(false);
      });

    return () => controller.abort();
  }, [s.searchOpen]);

  const found =
    q.length > 1
      ? products
          .filter((p) =>
            [p.name, p.categoryName]
              .join(" ")
              .toLocaleLowerCase("tr-TR")
              .includes(q.toLocaleLowerCase("tr-TR"))
          )
          .slice(0, 6)
      : [];
  return (
    <AnimatePresence>
      {s.searchOpen && (
        <>
          <motion.button
            onClick={s.closeSearch}
            aria-label="Aramayı kapat"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-label="Ürün ara"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-paper p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <div className="flex items-center border-b-2 border-black">
              <Search />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ürün ara"
                className="min-w-0 flex-1 bg-transparent p-4 text-xl outline-none"
              />
              <button onClick={s.closeSearch} className="p-2" aria-label="Aramayı kapat">
                <X />
              </button>
            </div>
            <div className="mt-8 space-y-1">
              {found.map((p) => (
                <Link
                  onClick={s.closeSearch}
                  href={`/products/${p.slug}`}
                  key={p.id}
                  className="flex justify-between border-b border-black/15 py-4 font-bold"
                >
                  <span>{p.name}</span>
                  <span>{formatPrice(p.price)}</span>
                </Link>
              ))}
              {q.length > 1 && loadingProducts && <p>Ürünler güncelleniyor…</p>}
              {q.length > 1 && !loadingProducts && !found.length && <p>Ürün bulunamadı.</p>}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

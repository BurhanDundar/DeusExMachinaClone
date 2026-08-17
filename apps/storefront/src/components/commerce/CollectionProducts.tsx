"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { Product } from "@/data/products";

type SortOption = "featured" | "price-asc" | "price-desc" | "name";

export function CollectionProducts({ products }: { products: Product[] }) {
  const [category, setCategory] = useState("all");
  const [size, setSize] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("featured");

  const categories = useMemo(
    () => [
      ...new Map(products.map((product) => [product.categorySlug, product.category])).entries(),
    ],
    [products]
  );
  const sizes = useMemo(
    () => [...new Set(products.flatMap((product) => product.availableSizes))],
    [products]
  );
  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (category !== "all" && product.categorySlug !== category) return false;
      if (size !== "all" && !product.availableSizes.includes(size)) return false;
      if (availableOnly && product.inventoryStatus !== "available") return false;
      return true;
    });
    return [...filtered].sort((left, right) => {
      if (sort === "price-asc") return left.price - right.price;
      if (sort === "price-desc") return right.price - left.price;
      if (sort === "name") return left.name.localeCompare(right.name, "tr");
      return Number(right.featured) - Number(left.featured);
    });
  }, [availableOnly, category, products, size, sort]);

  return (
    <>
      {products.length > 0 && (
        <div className="mb-8 flex flex-col gap-4 border-b border-black/15 pb-6 md:flex-row md:flex-wrap md:items-end">
          {categories.length > 1 && (
            <label className="text-xs font-bold uppercase tracking-wide md:w-52">
              Kategori
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 block h-11 w-full rounded-none border border-black/30 bg-paper px-3 text-sm font-semibold normal-case tracking-normal outline-none transition focus:border-black"
              >
                <option value="all">Tümü</option>
                {categories.map(([slug, label]) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {sizes.length > 1 && (
            <label className="text-xs font-bold uppercase tracking-wide md:w-52">
              Beden / seçenek
              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="mt-2 block h-11 w-full rounded-none border border-black/30 bg-paper px-3 text-sm font-semibold normal-case tracking-normal outline-none transition focus:border-black"
              >
                <option value="all">Tümü</option>
                {sizes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="text-xs font-bold uppercase tracking-wide md:ml-auto md:w-60">
            Sıralama
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="mt-2 block h-11 w-full rounded-none border border-black/30 bg-paper px-3 text-sm font-semibold normal-case tracking-normal outline-none transition focus:border-black"
            >
              <option value="featured">Öne çıkanlar</option>
              <option value="price-asc">Fiyat: düşükten yükseğe</option>
              <option value="price-desc">Fiyat: yüksekten düşüğe</option>
              <option value="name">Ürün adı</option>
            </select>
          </label>
          <label className="flex h-11 cursor-pointer items-center gap-3 border border-black/30 px-4 text-sm font-semibold transition hover:border-black md:self-end">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            Yalnızca satışta olanlar
          </label>
        </div>
      )}
      {products.length > 0 && (
        <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-black/50">
          {visibleProducts.length} ürün gösteriliyor
        </p>
      )}
      {visibleProducts.length ? (
        <div className="grid grid-cols-2 gap-x-2 gap-y-12 md:grid-cols-4 md:gap-x-3">
          {visibleProducts.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="border-b border-black/15 py-16 text-center md:py-24">
          <p className="display text-3xl md:text-4xl">
            {products.length ? "Bu filtrelere uygun ürün yok." : "Bu koleksiyonda henüz ürün yok."}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
            {products.length
              ? "Filtreleri değiştirerek diğer ürünleri görüntüleyebilirsin."
              : "Yeni ürünler eklendiğinde burada görüntülenecek."}
          </p>
        </div>
      )}
    </>
  );
}

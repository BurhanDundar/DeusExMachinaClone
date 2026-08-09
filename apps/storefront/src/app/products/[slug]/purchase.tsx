"use client";
import { useState } from "react";
import type { Product } from "@/data/products";
import { useUIStore } from "@/store/ui-store";
export function ProductPurchase({ product }: { product: Product }) {
  const [size, setSize] = useState("");
  const add = useUIStore((s) => s.add);
  return (
    <div className="mt-10">
      <p className="mb-3 font-bold">Seçenek</p>
      <div className="grid grid-cols-6 gap-1">
        {product.sizes.map((x) => (
          <button
            disabled={!product.availableSizes.includes(x)}
            onClick={() => setSize(x)}
            className={`border py-3 ${size === x ? "border-black bg-black text-white" : "border-black/25"} disabled:text-black/20`}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <button
        disabled={!size}
        onClick={() => add(product, size)}
        className="mt-4 w-full bg-black py-4 font-bold text-white disabled:bg-black/25"
      >
        Add to bag
      </button>
    </div>
  );
}

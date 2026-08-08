"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useState } from "react";
import { products } from "@/data/products";
import { useUIStore } from "@/store/ui-store";
export function SearchDrawer() {
  const s = useUIStore();
  const [q, setQ] = useState("");
  const found =
    q.length > 1
      ? products
          .filter((p) =>
            [p.name, p.category, p.collection, ...p.tags]
              .join(" ")
              .toLowerCase()
              .includes(q.toLowerCase())
          )
          .slice(0, 6)
      : [];
  return (
    <AnimatePresence>
      {s.searchOpen && (
        <>
          <motion.button
            onClick={s.closeSearch}
            aria-label="Close search"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            role="dialog"
            aria-label="Search"
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
                placeholder="Search products"
                className="min-w-0 flex-1 bg-transparent p-4 text-xl outline-none"
              />
              <button onClick={s.closeSearch} className="p-2">
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
                  <span>€{p.price}</span>
                </Link>
              ))}
              {q.length > 1 && !found.length && <p>No products found.</p>}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

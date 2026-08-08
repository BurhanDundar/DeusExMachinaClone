"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
export function MobileMenu({ open, close }: { open: boolean; close: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.22 }}
          className="fixed inset-x-0 bottom-0 top-[88px] z-30 bg-paper p-6 lg:hidden"
        >
          <nav className="space-y-1" aria-label="Mobile">
            {["New Arrivals", "Men", "Women", "Accessories", "Collections", "Journal"].map(
              (n, i) => (
                <Link
                  onClick={close}
                  href={
                    n === "Journal"
                      ? "/journal"
                      : `/collections/${n.toLowerCase().replaceAll(" ", "-")}`
                  }
                  key={n}
                  className="display flex items-center justify-between border-b border-black/15 py-4 text-3xl"
                >
                  {n}
                  <ArrowUpRight />
                </Link>
              )
            )}
          </nav>
          <p className="absolute bottom-8 text-sm text-black/55">
            Independent goods for life in motion.
          </p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

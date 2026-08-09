"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { formatPrice } from "@/lib/currency";
export function CartDrawer() {
  const s = useUIStore();
  const router = useRouter();
  const subtotal = s.items.reduce((n, i) => n + i.product.price * i.quantity, 0);
  const checkout = () => {
    s.closeCart();
    router.push("/checkout");
  };
  return (
    <AnimatePresence>
      {s.cartOpen && (
        <>
          <motion.button
            aria-label="Close cart"
            onClick={s.closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.22 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper p-5"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-black pb-5">
              <h2 className="display text-3xl">Your bag ({s.items.length})</h2>
              <button onClick={s.closeCart} className="focus-ring p-2">
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {s.items.length === 0 ? (
                <p className="py-12 text-center text-black/55">Your bag is ready for the road.</p>
              ) : (
                s.items.map((i) => (
                  <div
                    key={i.product.id + i.size}
                    className="grid grid-cols-[88px_1fr] gap-4 border-b border-black/15 py-5"
                  >
                    <div className="relative aspect-[4/5] bg-fog">
                      <Image src={i.product.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold">{i.product.name}</p>
                      <p className="mt-1 text-sm">
                        {i.product.color} / {i.size}
                      </p>
                      <p className="mt-2">{formatPrice(i.product.price * i.quantity)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button onClick={() => s.quantity(i.product.id, i.size, i.quantity - 1)}>
                          <Minus size={16} />
                        </button>
                        <span>{i.quantity}</span>
                        <button onClick={() => s.quantity(i.product.id, i.size, i.quantity + 1)}>
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => s.remove(i.product.id, i.size)}
                          className="ml-auto text-xs underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-black pt-5">
              <div className="mb-5 flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <button
                onClick={checkout}
                disabled={!s.items.length}
                className="focus-ring w-full bg-black py-4 font-bold text-white disabled:bg-black/25"
              >
                Checkout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

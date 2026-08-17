"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="bg-[#e6e5e1] px-6 py-16 md:px-12">
      <div className="max-w-xl">
        <h2 className="display text-4xl">Bizden haberdar olun</h2>
        <p className="mt-3 text-lg">
          Yeni ürünler, atölye hikâyeleri ve ilk siparişinize %10 indirim.
        </p>
        {done ? (
          <p className="mt-8 font-bold">Kaydınız tamamlandı. Yakında görüşmek üzere.</p>
        ) : (
          <form
            className="mt-8 flex border-b-2 border-black"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label className="sr-only" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="E-posta adresi"
              className="min-w-0 flex-1 bg-transparent py-4 outline-none"
            />
            <button className="focus-ring p-3" aria-label="Abone ol">
              <ArrowRight />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

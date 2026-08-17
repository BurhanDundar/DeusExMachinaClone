"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { apiRequest, ApiError } from "@/lib/api";
export function Newsletter() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setError("");
              const form = new FormData(e.currentTarget);
              try {
                await apiRequest<void>("/api/newsletter/subscriptions", {
                  method: "POST",
                  body: JSON.stringify({ email: String(form.get("email")), consent: true }),
                });
                setDone(true);
              } catch (cause) {
                setError(cause instanceof ApiError ? cause.message : "Kaydınız tamamlanamadı.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <label className="sr-only" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="E-posta adresi"
              className="min-w-0 flex-1 bg-transparent py-4 outline-none"
            />
            <button
              disabled={submitting}
              className="focus-ring p-3 disabled:opacity-50"
              aria-label="Abone ol"
            >
              <ArrowRight />
            </button>
          </form>
        )}
        {error && (
          <p className="mt-4 font-semibold text-red-800" role="alert">
            {error}
          </p>
        )}
        {!done && (
          <p className="mt-4 max-w-lg text-xs leading-5 text-black/60">
            Kaydolarak kampanya ve ürün duyurularını almayı kabul edersiniz. Ayrıntılar için
            gizlilik politikamızı inceleyin.
          </p>
        )}
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="bg-[#e6e5e1] px-6 py-16 md:px-12">
      <div className="max-w-xl">
        <h2 className="display text-4xl">Join the dispatch</h2>
        <p className="mt-3 text-lg">New releases, workshop stories and 10% off your first order.</p>
        {done ? (
          <p className="mt-8 font-bold">You're on the list. See you out there.</p>
        ) : (
          <form
            className="mt-8 flex border-b-2 border-black"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent py-4 outline-none"
            />
            <button className="focus-ring p-3" aria-label="Subscribe">
              <ArrowRight />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

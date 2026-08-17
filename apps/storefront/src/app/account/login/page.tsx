"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      router.replace("/account");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Şu anda giriş yapılamıyor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-20">
      <h1 className="display text-5xl">Hesabınıza giriş yapın</h1>
      <form className="mt-10 space-y-4" onSubmit={submit}>
        <label className="block">
          E-posta
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
        <label className="block">
          Şifre
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
        {error && (
          <p role="alert" className="border border-red-700 bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}
        <button
          disabled={submitting}
          className="w-full bg-black p-4 font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>
      <div className="mt-6 flex justify-between text-sm">
        <Link href="/account/register" className="underline">
          Hesap oluştur
        </Link>
        <button className="underline">Şifrenizi mi unuttunuz?</button>
      </div>
    </main>
  );
}

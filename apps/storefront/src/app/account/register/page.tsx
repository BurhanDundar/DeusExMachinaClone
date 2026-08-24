"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { ApiError } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextPath, setNextPath] = useState("");

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
      setNextPath(requestedPath);
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      await register({
        firstName: String(data.get("firstName")),
        lastName: String(data.get("lastName")),
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      router.replace(nextPath || "/account");
    } catch (cause) {
      if (cause instanceof ApiError) {
        const detail = cause.body.fieldErrors ? Object.values(cause.body.fieldErrors)[0] : null;
        setError(detail ?? cause.message);
      } else setError("Şu anda hesap oluşturulamıyor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-20">
      <h1 className="display text-5xl">Hesap oluştur</h1>
      <form className="mt-10 space-y-4" onSubmit={submit}>
        <label className="block">
          Ad
          <input
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={100}
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
        <label className="block">
          Soyad
          <input
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={100}
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            required
            aria-describedby="password-help"
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
        <p id="password-help" className="text-xs text-black/55">
          En az 8 karakter; büyük harf, küçük harf ve rakam içermelidir.
        </p>
        {error && (
          <p role="alert" className="border border-red-700 bg-red-50 p-3 text-red-800">
            {error}
          </p>
        )}
        <button
          disabled={submitting}
          className="w-full bg-black p-4 font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Hesap oluşturuluyor…" : "Hesap oluştur"}
        </button>
      </form>
      <Link
        href={nextPath ? `/account/login?next=${encodeURIComponent(nextPath)}` : "/account/login"}
        className="mt-6 block text-sm underline"
      >
        Zaten hesabınız var mı? Giriş yapın
      </Link>
    </main>
  );
}

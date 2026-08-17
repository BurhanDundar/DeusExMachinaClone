"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await apiRequest<void>("/api/auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email: String(form.get("email")) }),
      });
      setNotice("Bu adres kayıtlıysa şifre sıfırlama bağlantısı e-posta kutunuza gönderildi.");
      formElement.reset();
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "İstek gönderilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-20">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-black/50">Hesap</p>
      <h1 className="display mt-4 text-5xl">Şifrenizi sıfırlayın</h1>
      <p className="mt-5 leading-6 text-black/65">
        Hesabınızda kullandığınız e-posta adresini girin. Size 30 dakika geçerli bir bağlantı
        gönderelim.
      </p>
      <form className="mt-9 space-y-4" onSubmit={submit}>
        <label className="block font-semibold">
          E-posta
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full border border-black bg-transparent p-4"
          />
        </label>
        {notice && (
          <p className="border border-green-700 bg-green-50 p-3 text-green-900">{notice}</p>
        )}
        {error && <p className="border border-red-700 bg-red-50 p-3 text-red-900">{error}</p>}
        <button
          disabled={submitting}
          className="w-full bg-black p-4 font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
        </button>
      </form>
      <Link href="/account/login" className="mt-6 inline-block underline">
        Girişe dön
      </Link>
    </main>
  );
}

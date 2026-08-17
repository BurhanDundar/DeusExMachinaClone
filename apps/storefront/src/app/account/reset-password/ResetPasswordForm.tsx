"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword"));
    const confirmation = String(form.get("confirmation"));
    if (newPassword !== confirmation) {
      setError("Şifreler eşleşmiyor.");
      setSubmitting(false);
      return;
    }
    try {
      await apiRequest<void>("/api/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      setDone(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Şifre değiştirilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="mt-8 border border-red-700 bg-red-50 p-4">
        Sıfırlama bağlantısı eksik veya geçersiz.
      </p>
    );
  }
  if (done) {
    return (
      <div className="mt-8 border border-green-700 bg-green-50 p-5">
        <p className="font-bold">Şifreniz değiştirildi.</p>
        <Link href="/account/login" className="mt-3 inline-block underline">
          Yeni şifrenizle giriş yapın
        </Link>
      </div>
    );
  }
  return (
    <form className="mt-9 space-y-4" onSubmit={submit}>
      <label className="block font-semibold">
        Yeni şifre
        <input
          name="newPassword"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="mt-2 w-full border border-black bg-transparent p-4"
        />
      </label>
      <label className="block font-semibold">
        Yeni şifreyi tekrar girin
        <input
          name="confirmation"
          type="password"
          minLength={8}
          required
          autoComplete="new-password"
          className="mt-2 w-full border border-black bg-transparent p-4"
        />
      </label>
      <p className="text-sm text-black/60">
        En az 8 karakter; büyük harf, küçük harf ve rakam içermeli.
      </p>
      {error && <p className="border border-red-700 bg-red-50 p-3 text-red-900">{error}</p>}
      <button
        disabled={submitting}
        className="w-full bg-black p-4 font-bold text-white disabled:opacity-50"
      >
        {submitting ? "Kaydediliyor…" : "Yeni şifreyi kaydet"}
      </button>
    </form>
  );
}

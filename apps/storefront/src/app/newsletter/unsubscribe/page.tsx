"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, ApiError } from "@/lib/api";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Abonelikten çıkma bağlantısı eksik veya geçersiz.");
      return;
    }

    apiRequest<void>(`/api/newsletter/subscriptions/${encodeURIComponent(token)}`, {
      method: "DELETE",
    })
      .then(() => setState("done"))
      .catch((error) => {
        setState("error");
        setMessage(error instanceof ApiError ? error.message : "İşlem tamamlanamadı.");
      });
  }, [token]);

  return (
    <main className="mx-auto min-h-[65vh] max-w-2xl px-5 py-24 text-center">
      <h1 className="display text-5xl">Bülten aboneliği</h1>
      {state === "loading" && <p className="mt-6">İşleminiz tamamlanıyor…</p>}
      {state === "done" && (
        <p className="mt-6 font-semibold">
          Aboneliğiniz sonlandırıldı. Artık pazarlama iletileri almayacaksınız.
        </p>
      )}
      {state === "error" && <p className="mt-6 text-red-800">{message}</p>}
      <Link className="focus-ring mt-8 inline-block font-bold underline" href="/">
        Ana sayfaya dön
      </Link>
    </main>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense fallback={<main className="min-h-[65vh] px-5 py-24">Yükleniyor…</main>}>
      <UnsubscribeContent />
    </Suspense>
  );
}

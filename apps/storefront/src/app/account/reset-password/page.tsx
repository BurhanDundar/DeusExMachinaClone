import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-5 py-20">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-black/50">Hesap</p>
      <h1 className="display mt-4 text-5xl">Yeni şifre oluşturun</h1>
      <Suspense fallback={<p className="mt-8">Bağlantı doğrulanıyor…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}

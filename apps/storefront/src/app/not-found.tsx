import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto min-h-[65vh] max-w-2xl px-5 py-24 text-center">
      <p className="text-sm font-bold uppercase tracking-[.18em] text-black/55">404</p>
      <h1 className="display mt-4 text-5xl">Bu sayfa bulunamadı</h1>
      <p className="mt-5 text-black/65">
        Bağlantı değişmiş veya aradığınız içerik kaldırılmış olabilir.
      </p>
      <Link
        className="focus-ring mt-8 inline-block bg-black px-6 py-3 font-bold text-white"
        href="/"
      >
        Ana sayfaya dön
      </Link>
    </main>
  );
}

"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto min-h-[65vh] max-w-xl px-5 py-24">
      <p className="text-sm font-bold uppercase tracking-[.16em] text-red-800">Bağlantı sorunu</p>
      <h1 className="display mt-4 text-5xl">İçerik yüklenemedi</h1>
      <p className="mt-6 leading-7 text-black/65">
        Ürün kataloğuna şu anda erişilemiyor. Lütfen bağlantınızı kontrol edip tekrar deneyin.
      </p>
      <button onClick={reset} className="focus-ring mt-8 bg-black px-6 py-3 font-bold text-white">
        Tekrar dene
      </button>
    </main>
  );
}

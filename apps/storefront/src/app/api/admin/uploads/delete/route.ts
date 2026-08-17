import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireAdministrator } from "@/lib/server/require-admin";

function isManagedProductBlob(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".blob.vercel-storage.com") &&
      url.pathname.startsWith("/products/")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob depolama anahtarı bulunamadı." }, { status: 503 });
  }
  try {
    await requireAdministrator(request);
    const body = (await request.json()) as { urls?: unknown };
    const urls = Array.isArray(body.urls)
      ? [
          ...new Set(
            body.urls.filter(
              (url): url is string => typeof url === "string" && isManagedProductBlob(url)
            )
          ),
        ].slice(0, 20)
      : [];
    if (urls.length) await del(urls);
    return NextResponse.json({ deleted: urls.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Görseller silinemedi." },
      { status: 400 }
    );
  }
}

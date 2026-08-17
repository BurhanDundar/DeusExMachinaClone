import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const apiOrigin = (
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/api\/?$/, "");

type CurrentUser = { role?: string };

async function requireAdministrator(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer "))
    throw new Error("Görsel yüklemek için giriş yapmalısın.");

  const response = await fetch(`${apiOrigin}/api/users/me`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yap.");

  const user = (await response.json()) as CurrentUser;
  if (user.role !== "ADMIN") throw new Error("Bu işlem için yönetici yetkisi gerekli.");
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Görsel depolama henüz yapılandırılmadı. BLOB_READ_WRITE_TOKEN eklenmeli." },
      { status: 503 }
    );
  }

  try {
    await requireAdministrator(request);
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("products/")) throw new Error("Geçersiz yükleme konumu.");
        return {
          allowedContentTypes: imageTypes,
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Görsel yükleme izni verilemedi." },
      { status: 400 }
    );
  }
}

const apiOrigin = (
  process.env.API_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080"
).replace(/\/api\/?$/, "");

type CurrentUser = { role?: string };

export async function requireAdministrator(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Bu işlem için giriş yapmalısınız.");
  }
  const response = await fetch(`${apiOrigin}/api/users/me`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  const user = (await response.json()) as CurrentUser;
  if (user.role !== "ADMIN") throw new Error("Bu işlem için yönetici yetkisi gerekli.");
}

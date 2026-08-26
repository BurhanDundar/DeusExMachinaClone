const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// API callers use paths such as `/api/auth/login`. In production, Vercel proxies
// the same `/api` path to Render, so avoid building `/api/api/...` URLs.
export const API_URL = configuredApiUrl.replace(/\/api\/?$/, "");

export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody
  ) {
    super(body.message);
  }
}

const API_TIMEOUT_MS = 10_000;

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
      signal: init.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    throw new ApiError(timedOut ? 408 : 503, {
      code: timedOut ? "REQUEST_TIMEOUT" : "SERVICE_UNAVAILABLE",
      message: timedOut
        ? "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
        : "Sunucuya şu anda ulaşılamıyor. Lütfen kısa süre sonra tekrar deneyin.",
    });
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({
      code: "REQUEST_FAILED",
      message: "İstek tamamlanamadı.",
    }));
    throw new ApiError(response.status, body);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

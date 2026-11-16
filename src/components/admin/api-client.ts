export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Thin fetch wrapper for admin endpoints that always resolves to a typed success/error result. */
export async function adminRequest<T = Record<string, unknown>>(url: string, init: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, init);
    const body = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) {
      if (response.status === 401) return { ok: false, error: "Your session expired. Please reload the page and sign in again." };
      return { ok: false, error: body.error ?? `Request failed (${response.status}).` };
    }
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}

export function jsonInit(method: "POST" | "PATCH" | "DELETE", body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

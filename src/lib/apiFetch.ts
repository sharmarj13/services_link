/**
 * Central API fetch utility — automatically attaches CSRF token
 * from the `csrf_token` cookie for all state-mutating requests.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/apiFetch";
 *   const res = await apiFetch("/api/work-requests", { method: "POST", body: JSON.stringify(data) });
 */

import { API_BASE_URL } from "@/config";

/** Read a cookie value by name from document.cookie */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

/** Fetch wrapper that injects X-CSRF-Token + credentials for all API calls */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers = new Headers(options.headers);

  // Always send JSON content type for mutating requests unless body is FormData
  if (isMutating && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach CSRF token from cookie for all mutating requests
  if (isMutating) {
    const csrfToken = getCookie("csrf_token");
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // always send session cookies
  });
}

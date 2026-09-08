// Thin fetch wrapper for the client-side hooks. Keeps error handling (and
// the JSON parse) in one place instead of repeating it in every hook.
export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

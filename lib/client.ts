export async function post<T = { ok: boolean }>(
  url: string,
  data: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "La demande n’a pas abouti.");
  return result as T;
}

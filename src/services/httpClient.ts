export async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error('HTTP error');
  return res.json();
}

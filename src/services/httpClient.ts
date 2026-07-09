import { isPublicMode } from '../app/AppConfig';

export async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    cache: isPublicMode() ? 'no-store' : undefined,
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error('HTTP error');
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

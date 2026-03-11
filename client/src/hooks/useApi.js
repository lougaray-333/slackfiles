const BASE = '';

export function useApi() {
  async function request(path, options = {}) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  return { get: (p) => request(p), post: (p, b) => request(p, { method: 'POST', body: JSON.stringify(b) }), patch: (p, b) => request(p, { method: 'PATCH', body: JSON.stringify(b) }), del: (p) => request(p, { method: 'DELETE' }) };
}

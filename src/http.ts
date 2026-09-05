export class KooperativaApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'KooperativaApiError';
    this.status = status;
    this.code = code;
  }
}

export function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export interface HttpClientConfig {
  apiKey: string;
  baseUrl: string;
  fetchImpl: typeof fetch;
}

export class HttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async get<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  async del<T>(path: string, query?: Record<string, unknown>): Promise<T> {
    return this.request<T>('DELETE', path, { query });
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    options: { query?: Record<string, unknown>; body?: unknown } = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}${buildQuery(options.query)}`;
    const res = await this.config.fetchImpl(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    let json: unknown;
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        // Non-JSON body; fall through with the raw text captured below.
      }
    }

    if (!res.ok) {
      const errObj = json as { error?: string; code?: string } | undefined;
      const message = errObj?.error ?? text ?? `Request failed with status ${res.status}`;
      throw new KooperativaApiError(res.status, message, errObj?.code);
    }

    return json as T;
  }
}

'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
export class ClientError extends Error {
  constructor(
    message: string,
    public status = 0,
    public fields: Record<string, string[]> = {}
  ) {
    super(message);
  }
}
export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: {
        ...(options.body && !(options.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ClientError('The connection was interrupted. Please try again.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok)
    throw new ClientError(
      result?.error || 'The request could not be completed.',
      response.status,
      result?.fields || {}
    );
  return result as T;
}
export function announceContentChange() {
  window.dispatchEvent(new Event('buildnext:content-updated'));
}
export function useRemote<T>(url: string | null, poll = 30000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ClientError | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [revision, setRevision] = useState(0);
  const previous = useRef<string | null>(null);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    if (previous.current !== url) {
      setData(null);
      setLoading(true);
      previous.current = url;
    }
    api<T>(url, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setError(null);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, revision]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') reload();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('buildnext:content-updated', refresh);
    const timer = poll ? window.setInterval(refresh, poll) : undefined;
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('buildnext:content-updated', refresh);
      window.clearInterval(timer);
    };
  }, [poll, reload]);
  return { data, error, loading, reload };
}

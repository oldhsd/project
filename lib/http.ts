import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  });
}
export function fail(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError)
    return json(
      { error: 'Please check the highlighted fields.', fields: error.flatten().fieldErrors },
      400
    );
  if ((error as { code?: number })?.code === 11000)
    return json({ error: 'This record already exists.' }, 409);
  // Do not expose database addresses, credentials, stack traces or submitted personal data.
  console.error('BuildNext request failed', {
    name: error instanceof Error ? error.name : 'UnknownError',
  });
  return json({ error: 'The service is temporarily unavailable. Please try again.' }, 503);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.AUTH_URL || process.env.NEXTAUTH_URL || request.url).origin;
  if (!origin || origin !== expected || request.headers.get('sec-fetch-site') === 'cross-site')
    throw new ApiError(403, 'The request origin is not allowed.');
}
export async function bodyJson(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    throw new ApiError(415, 'Send a JSON request.');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'A request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256 * 1024) {
        await reader.cancel();
        throw new ApiError(413, 'This request is too large.');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    try {
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      throw new ApiError(400, 'The request contains invalid JSON.');
    }
  } finally {
    reader.releaseLock();
  }
}

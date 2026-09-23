import { isResource, type Resource } from '@/lib/content-schema';
import { requireAdmin, requireUser } from '@/lib/access';
import {
  archiveRecord,
  createRecord,
  getRecord,
  listRecords,
  updateRecord,
  verifyCertificate,
} from '@/lib/data-service';
import { ApiError, bodyJson, fail, json, sameOrigin } from '@/lib/http';
import { z } from 'zod';

export function resourceName(name: string): Resource {
  if (!isResource(name)) throw new ApiError(404, 'Collection not found.');
  return name;
}
export async function publicList(request: Request, name: string) {
  try {
    const resource = resourceName(name);
    const params = new URL(request.url).searchParams;
    if (resource === 'certificates' && params.has('id'))
      return json({ certificate: await verifyCertificate(params.get('id')!) });
    const user = ['certificates', 'applications', 'submissions'].includes(resource)
      ? await requireUser()
      : null;
    const data = await listRecords(
      resource,
      Object.fromEntries(params),
      false,
      user ? String(user._id) : undefined
    );
    return json({ ...data, [resource]: data.items });
  } catch (error) {
    return fail(error);
  }
}
export async function publicDetail(_request: Request, name: string, id: string) {
  try {
    return json({ item: await getRecord(resourceName(name), id) });
  } catch (error) {
    return fail(error);
  }
}
export async function adminRequest(request: Request, name: string, id?: string) {
  try {
    const actor = await requireAdmin();
    const resource = resourceName(name);
    if (request.method === 'GET')
      return json(
        id
          ? { item: await getRecord(resource, id, true) }
          : await listRecords(resource, Object.fromEntries(new URL(request.url).searchParams), true)
      );
    sameOrigin(request);
    const input = await bodyJson(request);
    if (request.method === 'POST' && !id)
      return json({ item: await createRecord(resource, input, actor) }, 201);
    if (request.method === 'PATCH' && id)
      return json({ item: await updateRecord(resource, id, input, actor) });
    if (request.method === 'DELETE' && id) {
      const { version } = z
        .object({ version: z.number().int().min(0) })
        .strict()
        .parse(input);
      return json({ item: await archiveRecord(resource, id, version, actor) });
    }
    throw new ApiError(405, 'Method not allowed.');
  } catch (error) {
    return fail(error);
  }
}

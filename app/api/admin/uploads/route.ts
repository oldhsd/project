import { requireAdmin } from '@/lib/access';
import { gridFsBucket } from '@/lib/mongodb';
import { ApiError, fail, json, sameOrigin } from '@/lib/http';

export const dynamic = 'force-dynamic';
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

export async function POST(request: Request) {
  try {
    await requireAdmin();
    sameOrigin(request);

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new ApiError(400, 'Choose a file to upload.');
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new ApiError(400, 'Only PDF files can be uploaded here.');
    }
    if (file.size > MAX_BYTES) throw new ApiError(413, 'File is larger than the 20MB limit.');

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = await gridFsBucket();
    const id = await new Promise<string>((resolve, reject) => {
      const upload = bucket.openUploadStream(file.name.slice(0, 180), {
        contentType: 'application/pdf',
      });
      upload.on('error', reject);
      upload.on('finish', () => resolve(String(upload.id)));
      upload.end(buffer);
    });

    return json({ url: `/api/files/${id}`, label: file.name.replace(/\.pdf$/i, '') }, 201);
  } catch (error) {
    return fail(error);
  }
}

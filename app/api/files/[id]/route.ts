import { requireUser } from '@/lib/access';
import { objectId } from '@/lib/content-schema';
import { gridFsBucket } from '@/lib/mongodb';
import { ApiError, fail } from '@/lib/http';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    const { id } = await params;
    if (!objectId.safeParse(id).success) throw new ApiError(404, 'File not found.');

    const bucket = await gridFsBucket();
    const [file] = await bucket.find({ _id: new mongoose.Types.ObjectId(id) }).toArray();
    if (!file) throw new ApiError(404, 'File not found.');

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const download = bucket.openDownloadStream(file._id);
      download.on('data', (chunk) => chunks.push(chunk));
      download.on('end', () => resolve());
      download.on('error', reject);
    });

    return new Response(Buffer.concat(chunks), {
      headers: {
        'Content-Type': file.contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${(file.filename || 'file.pdf').replace(/"/g, '')}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return fail(error);
  }
}

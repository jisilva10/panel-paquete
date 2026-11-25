import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { COOKIE, sesionValida } from '../../../lib/sesion';

// El navegador sube el MP4 directo al almacén (sin pasar por la función, que tiene límite de 4,5 MB).
export async function POST(req) {
  const body = await req.json();
  try {
    const r = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        if (!(await sesionValida(req.cookies.get(COOKIE)?.value))) throw new Error('Sin sesión');
        return { allowedContentTypes: ['video/mp4', 'video/quicktime'], maximumSizeInBytes: 1024 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

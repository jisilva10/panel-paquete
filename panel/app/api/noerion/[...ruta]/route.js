import { NextResponse } from 'next/server';
import { noerion } from '../../../../lib/noerion';

// Puente al panel de Noerion: solo lo que usan las tarjetas (marcar publicado en TikTok, la cola).
const PERMITIDAS = ['publicaciones', 'resumen'];

async function pasar(req, { params }) {
  const { ruta } = await params;
  const camino = (ruta || []).join('/');
  if (!PERMITIDAS.includes(camino)) return NextResponse.json({ error: 'No permitido' }, { status: 404 });
  const body = req.method === 'GET' ? undefined : await req.text();
  const r = await noerion(camino, { method: req.method, body });
  return new NextResponse(await r.text(), { status: r.status, headers: { 'Content-Type': 'application/json' } });
}
export const GET = pasar, PATCH = pasar, POST = pasar;
export const dynamic = 'force-dynamic';

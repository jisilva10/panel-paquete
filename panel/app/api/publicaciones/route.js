import { NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { db } from '../../../lib/db';

export async function GET() {
  const { data, error } = await db().from('publicaciones').select('id,pieza,programada_para,estado,ig_estado,tt_estado,yt_estado,ig_error,tt_error,etiquetas').neq('estado', 'cancelada').order('programada_para', { ascending: false }).limit(30);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req) {
  const b = await req.json();
  if (!b.pieza || !b.programada_para || !b.video_url || !b.redes?.length) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
  const fila = {
    pieza: b.pieza.trim(),
    texto: b.texto || '',
    programada_para: b.programada_para,
    redes: b.redes,
    video_url: b.video_url,
    portada_url: b.portada_url || null,
    etiquetas: b.etiquetas || {},
    video_bytes: b.video_bytes,
    duracion: b.duracion,
    ig_estado: b.redes.includes('instagram') ? 'pendiente' : 'no_va',
    tt_estado: b.redes.includes('tiktok') ? 'pendiente' : 'no_va',
    yt_estado: b.redes.includes('youtube') ? 'pendiente' : 'no_va',
  };
  const { data: misma } = await db().from('publicaciones').select('id').eq('pieza', fila.pieza).in('estado', ['programada', 'en_curso']);
  if (misma?.length) return NextResponse.json({ error: `«${fila.pieza}» ya está en la cola` }, { status: 409 });
  const { data, error } = await db().from('publicaciones').insert(fila).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Cambios desde el panel: cancelar, reintentar, sacar ya, cambiar hora o texto.
export async function PATCH(req) {
  const { id, accion, ...campos } = await req.json();
  const { data: p } = await db().from('publicaciones').select('*').eq('id', id).single();
  if (!p) return NextResponse.json({ error: 'No existe' }, { status: 404 });
  let cambio = {};
  if (accion === 'cancelar') {
    if (p.ig_estado === 'publicado' || ['en_tiktok', 'en_borradores', 'publicado'].includes(p.tt_estado) || p.yt_estado === 'publicado') return NextResponse.json({ error: 'Ya salió en una red' }, { status: 409 });
    cambio = { estado: 'cancelada' };
    if (p.video_url) { try { await del(p.video_url); } catch {} cambio.video_url = null; }
  } else if (accion === 'reintentar') {
    if (!p.video_url) return NextResponse.json({ error: 'El video ya no está: súbelo de nuevo' }, { status: 409 });
    cambio = { estado: 'programada' };
    if (p.ig_estado === 'error') Object.assign(cambio, { ig_estado: 'pendiente', ig_error: null, ig_contenedor: null });
    if (p.tt_estado === 'error') Object.assign(cambio, { tt_estado: 'pendiente', tt_error: null });
  } else if (accion === 'tt_publicado') {
    if (p.tt_estado !== 'en_borradores') return NextResponse.json({ error: 'No está en borradores' }, { status: 409 });
    cambio = { tt_estado: 'publicado' };
  } else if (accion === 'yt_publicado') {
    if (p.yt_estado !== 'para_ti') return NextResponse.json({ error: 'Todavía no le toca a YouTube' }, { status: 409 });
    cambio = { yt_estado: 'publicado', yt_url: campos.yt_url || null };
  } else if (accion === 'ya') {
    cambio = { programada_para: new Date().toISOString() };
  } else if (accion === 'editar') {
    if (p.estado !== 'programada') return NextResponse.json({ error: 'Ya empezó a salir' }, { status: 409 });
    for (const k of ['texto', 'programada_para', 'pieza']) if (campos[k] != null) cambio[k] = campos[k];
  }
  const { data, error } = await db().from('publicaciones').update(cambio).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

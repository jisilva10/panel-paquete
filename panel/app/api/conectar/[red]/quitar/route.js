import { NextResponse } from 'next/server';
import { base } from '../../../../../lib/sesion';
import { db, anotar } from '../../../../../lib/db';
import * as yt from '../../../../../lib/youtube';

// Desconectar YouTube desde el panel: revoca la llave en Google al momento y la borra de la base
// (lo pide la política de YouTube API Services). Los números siguen con la llave de Google, que es aparte.
export async function POST(req, { params }) {
  const { red } = await params;
  const ir = (q) => NextResponse.redirect(`${base(req)}/conectar?${q}`, 303);
  if (red !== 'youtube') return ir('fallo=Solo%20YouTube%20se%20desconecta%20desde%20aqu%C3%AD');
  const { data: c } = await db().from('cuentas').select('access_token,refresh_token').eq('red', 'youtube').maybeSingle();
  await yt.revocar(c?.refresh_token || c?.access_token);
  await db().from('cuentas').update({ access_token: 'llave-de-google', refresh_token: null, expira: null, refresh_expira: null, actualizado: new Date().toISOString() }).eq('red', 'youtube');
  await anotar('desconectado', 'youtube (subida)');
  return ir('listo=youtube_fuera');
}

import { NextResponse } from 'next/server';
import { base } from '../../../../lib/sesion';
import * as ig from '../../../../lib/instagram';
import * as tt from '../../../../lib/tiktok';
import * as yt from '../../../../lib/youtube';

export async function GET(req, { params }) {
  const { red } = await params;
  const state = crypto.randomUUID();
  const vuelta = `${base(req)}/api/conectar/${red}/vuelta`;
  if (red === 'youtube' && !yt.oauthListo()) return NextResponse.redirect(`${base(req)}/conectar?fallo=${encodeURIComponent('Faltan YT_CLIENT_ID y YT_CLIENT_SECRET en Vercel (los pone JIS)')}`, 303);
  const url = red === 'instagram' ? ig.urlAutorizar(vuelta, state) : red === 'tiktok' ? tt.urlAutorizar(vuelta, state) : red === 'youtube' ? yt.urlAutorizar(vuelta, state) : null;
  if (!url) return NextResponse.json({ error: 'Red desconocida' }, { status: 404 });
  const r = NextResponse.redirect(url);
  r.cookies.set(`estado_${red}`, state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  return r;
}

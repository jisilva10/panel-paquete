import { NextResponse } from 'next/server';
import { COOKIE, firma, clavePanel } from '../../../lib/sesion';

export async function POST(req) {
  const f = await req.formData();
  const clave = String(f.get('clave') || '').trim();
  const u = new URL('/', req.url);
  if (!clavePanel() || clave !== clavePanel()) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.redirect(new URL('/entrar?mal=1', req.url), 303);
  }
  const r = NextResponse.redirect(u, 303);
  r.cookies.set(COOKIE, await firma('cuenta-panel-v1'), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90 });
  return r;
}

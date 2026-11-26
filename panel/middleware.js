import { NextResponse } from 'next/server';
import { COOKIE, sesionValida, esLaMac } from './lib/sesion';

const LIBRES = ['/entrar', '/api/entrar', '/privacidad', '/terminos', '/api/cron/', '/api/subida', '/favicon', '/icono', '/icon', '/apple-icon', '/manifest.webmanifest', '/logo-'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  // Solo en la compu, con PANEL_DEMO=1: se entra sin clave para ver el panel con datos de ejemplo.
  if (process.env.PANEL_DEMO === '1' && process.env.NODE_ENV !== 'production') return NextResponse.next();
  if (LIBRES.some((r) => pathname.startsWith(r))) return NextResponse.next();
  if (await sesionValida(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/') && esLaMac(req)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Sin sesión' }, { status: 401 });
  const u = req.nextUrl.clone();
  u.pathname = '/entrar';
  return NextResponse.redirect(u);
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };

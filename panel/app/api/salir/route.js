import { NextResponse } from 'next/server';
import { COOKIE } from '../../../lib/sesion';

export async function POST(req) {
  const r = NextResponse.redirect(new URL('/entrar', req.url), 303);
  r.cookies.delete(COOKIE);
  return r;
}

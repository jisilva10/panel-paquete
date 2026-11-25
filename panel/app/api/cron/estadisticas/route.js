import { NextResponse } from 'next/server';
import { esLaMac } from '../../../../lib/sesion';
import { leerTodo } from '../../../../lib/estadisticas';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}` && !esLaMac(req)) return NextResponse.json({ error: 'no' }, { status: 401 });
  return NextResponse.json(await leerTodo());
}

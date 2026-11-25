import { NextResponse } from 'next/server';
import { esLaMac } from '../../../../lib/sesion';
import { correrCola } from '../../../../lib/publicar';
import { anotar } from '../../../../lib/db';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}` && !esLaMac(req)) return NextResponse.json({ error: 'no' }, { status: 401 });
  try {
    return NextResponse.json(await correrCola());
  } catch (e) {
    await anotar('error', `Cola: ${e.message}`);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

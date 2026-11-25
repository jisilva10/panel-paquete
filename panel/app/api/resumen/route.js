import { NextResponse } from 'next/server';
import { resumen } from '../../../lib/resumen';

export const dynamic = 'force-dynamic';

// Lo mismo que muestra «Cómo va», en datos: para revisarlo desde la Mac y para la auditoría.
export async function GET() {
  return NextResponse.json(await resumen());
}

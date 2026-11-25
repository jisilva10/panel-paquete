import { NextResponse } from 'next/server';
import pg from 'pg';
import { db } from '../../../lib/db';

export const dynamic = 'force-dynamic';

// Para revisar desde la Mac: conteos, cuentas conectadas (sin llaves) y lo último que pasó.
export async function GET() {
  const n = async (t) => (await db().from(t).select('*', { count: 'exact', head: true })).count;
  const [medios, metricas, cola, diarias] = await Promise.all(['medios', 'metricas', 'publicaciones', 'cuenta_diaria'].map(n));
  const { data: cuentas } = await db().from('cuentas').select('red,usuario,expira,refresh_expira');
  const { data: bitacora } = await db().from('bitacora').select('cuando,tipo,detalle').order('cuando', { ascending: false }).limit(12);
  let reloj = null;
  try {
    const c = new pg.Client({ connectionString: (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL).replace(/[?&]sslmode=[^&]+/, ''), ssl: { rejectUnauthorized: false } });
    await c.connect();
    reloj = (await c.query(`select r.status_code, r.created, left(coalesce(r.error_msg, r.content::text, ''), 120) as detalle from net._http_response r order by r.created desc limit 4`)).rows;
    await c.end();
  } catch (e) { reloj = e.message; }
  // Forma de las llaves pegadas a mano, sin mostrarlas: largo limpio y si traen basura en los bordes o adentro.
  const forma = (v = '') => ({ definida: !!v, largo: v.trim().length, bordeSucio: v !== v.trim(), raroAdentro: /[^\x21-\x7e]/.test(v.trim()) });
  const clave = Object.fromEntries(['PANEL_CLAVE', 'IG_APP_ID', 'IG_APP_SECRET', 'TT_CLIENT_KEY', 'TT_CLIENT_SECRET'].map((n) => [n, forma(process.env[n])]));
  return NextResponse.json({ medios, metricas, cola, diarias, cuentas, bitacora, reloj, clave });
}

// Prepara la base desde el servidor (ahí viven las llaves de Supabase; nunca bajan a la Mac):
// tablas y reloj de Supabase. Se puede correr las veces que haga falta.
import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';

const leer = (f) => fs.readFileSync(path.join(process.cwd(), f), 'utf8');

export async function POST(req) {
  const { paso = 'todo' } = await req.json().catch(() => ({}));
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  const c = new pg.Client({ connectionString: url.replace(/[?&]sslmode=[^&]+/, ''), ssl: { rejectUnauthorized: false } });
  await c.connect();
  const hecho = {};
  try {
    if (paso === 'todo' || paso === 'tablas') {
      await c.query(leer('supabase/esquema.sql'));
      hecho.tablas = (await c.query(`select table_name from information_schema.tables where table_schema='public' order by 1`)).rows.map((r) => r.table_name);
    }
    if (paso === 'todo' || paso === 'reloj') {
      const ya = await c.query(`select id from vault.secrets where name = 'panel_cron'`);
      if (ya.rows.length) await c.query(`select vault.update_secret($1, $2)`, [ya.rows[0].id, process.env.CRON_SECRET]);
      else await c.query(`select vault.create_secret($1, 'panel_cron')`, [process.env.CRON_SECRET]);
      await c.query(leer('supabase/reloj.sql').replaceAll('{{PANEL_URL}}', process.env.PANEL_URL.replace(/\/$/, '')));
      hecho.reloj = (await c.query(`select jobname, schedule from cron.job where jobname like 'panel-%'`)).rows;
    }
    return NextResponse.json(hecho);
  } catch (e) {
    return NextResponse.json({ error: e.message, hecho }, { status: 500 });
  } finally {
    await c.end();
  }
}

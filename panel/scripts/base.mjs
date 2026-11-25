// npm run db              → tablas + reloj (lo hace el servidor)
// npm run db -- tablas|reloj   → solo ese paso
// npm run estado          → conteos, cuentas conectadas y bitácora
import fs from 'node:fs';
import { panel } from './panel.mjs';

const paso = process.argv[2] || 'todo';
if (paso === 'estado') {
  const e = await panel('/api/estado');
  console.log(`medios ${e.medios} · métricas ${e.metricas} · cola ${e.cola} · días de cuenta ${e.diarias}`);
  for (const [n, f] of Object.entries(e.clave || {})) console.log(`  ${n.padEnd(17)} ${f.definida ? `largo ${f.largo}` : 'FALTA'}${f.bordeSucio ? ' · traía espacio o salto al borde' : ''}${f.raroAdentro ? ' · ⚠ carácter raro adentro' : ''}`);
  console.log('cuentas:', (e.cuentas || []).map((c) => `${c.red} @${c.usuario}`).join(', ') || 'ninguna');
  console.log('reloj (últimas llamadas):'); for (const r of Array.isArray(e.reloj) ? e.reloj : [{ detalle: e.reloj }]) console.log(`  ${String(r.created || '').slice(0, 19)}  ${r.status_code ?? ''}  ${r.detalle || ''}`);
  for (const b of e.bitacora || []) console.log(`  ${b.cuando.slice(0, 16)}  ${b.tipo.padEnd(10)} ${b.detalle}`);
} else {
  const body = { paso };
  console.log(JSON.stringify(await panel('/api/montar', { method: 'POST', body }), null, 1));
}

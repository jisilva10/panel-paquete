// Sube al panel el etiquetas.json de cada función (las palancas de .motor/variables.json), para que «Qué está ganando»
// compare con lo que de verdad se hizo. Lo corre el video 1 cada día (RECETA, paso 1). Uso: npm run etiquetas
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { panel } from './panel.mjs';

const FUN = fileURLToPath(new URL('../../2 Funciones/', import.meta.url));
const lista = await panel('/api/publicaciones');
const pubs = Array.isArray(lista) ? lista : [];
let subidas = 0;
for (const nombre of fs.readdirSync(FUN).filter((n) => /^\d{3}\. /.test(n)).sort()) {
  const f = path.join(FUN, nombre, 'etiquetas.json');
  if (!fs.existsSync(f)) continue;
  const etiquetas = JSON.parse(fs.readFileSync(f, 'utf8'));
  const p = pubs.find((x) => x.pieza === nombre);
  if (!p) { console.log(`· ${nombre}: no está en el panel (todavía)`); continue; }
  if (JSON.stringify(p.etiquetas || {}) === JSON.stringify(etiquetas)) continue;
  await panel('/api/publicaciones', { method: 'PATCH', body: { id: p.id, accion: 'etiquetas', etiquetas } });
  console.log(`✓ ${nombre}`); subidas++;
}
console.log(`listo: ${subidas} funciones con etiquetas nuevas en el panel`);

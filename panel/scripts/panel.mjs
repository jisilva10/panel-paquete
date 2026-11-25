// La Mac habla con el panel con su propia llave (.secretos/mac.txt). Las llaves de Supabase no bajan nunca.
// La dirección del panel va en .secretos/url.txt (se escribe al publicarlo por primera vez).
import fs from 'node:fs';
const leer = (f) => { try { return fs.readFileSync(new URL(`../.secretos/${f}`, import.meta.url), 'utf8').trim(); } catch { return null; } };
export const PANEL = process.env.PANEL_URL_LOCAL || leer('url.txt') || 'http://localhost:3310';
const llave = () => leer('mac.txt') || (() => { throw new Error('Falta .secretos/mac.txt'); })();

export async function panel(ruta, { method = 'GET', body } = {}) {
  const r = await fetch(`${PANEL}${ruta}`, {
    method,
    headers: { Authorization: `Bearer ${llave()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}

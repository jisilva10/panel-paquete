import { createClient } from '@supabase/supabase-js';

let cliente;
// Solo en el servidor: usa la llave de servicio, que nunca llega al navegador.
export function db() {
  if (!cliente) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !llave) throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    cliente = createClient(url, llave, { auth: { persistSession: false } });
  }
  return cliente;
}

export async function anotar(tipo, detalle) {
  try {
    await db().from('bitacora').insert({ tipo, detalle: typeof detalle === 'string' ? detalle : JSON.stringify(detalle) });
  } catch {}
}

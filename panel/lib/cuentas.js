import { db, anotar } from './db';
import * as ig from './instagram';
import * as tt from './tiktok';
import * as yt from './youtube';

export async function cuentasConectadas() {
  const { data } = await db().from('cuentas').select('red,usuario,expira,refresh_expira,actualizado,refresh_token');
  // La llave nunca sale de aquí: solo se dice si está («para_subir», que en YouTube = conectado con OAuth).
  return Object.fromEntries((data || []).map(({ refresh_token, ...c }) => [c.red, { ...c, para_subir: Boolean(refresh_token) }]));
}

export async function guardarCuenta(red, datos) {
  const { error } = await db().from('cuentas').upsert({ red, ...datos, actualizado: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

// Devuelve un token vigente; lo renueva solo si se está por vencer.
export async function tokenDe(red) {
  const { data: c } = await db().from('cuentas').select('*').eq('red', red).maybeSingle();
  if (!c) return null;
  const faltaMs = c.expira ? new Date(c.expira).getTime() - Date.now() : Infinity;
  try {
    if (red === 'instagram' && faltaMs < 20 * 86400 * 1000) {
      const n = await ig.refrescar(c.access_token);
      await guardarCuenta(red, n);
      await anotar('token', 'Instagram renovado');
      return { ...c, ...n };
    }
    if (red === 'tiktok' && faltaMs < 10 * 60 * 1000) {
      const n = await tt.refrescar(c.refresh_token);
      await guardarCuenta(red, n);
      return { ...c, ...n };
    }
    // YouTube: la llave dura 1 hora; se renueva con la larga (solo si se conectó para subir).
    if (red === 'youtube' && c.refresh_token && faltaMs < 5 * 60 * 1000) {
      const n = await yt.refrescar(c.refresh_token);
      await guardarCuenta(red, n);
      return { ...c, ...n };
    }
  } catch (e) {
    await anotar('error', `No se pudo renovar ${red}: ${e.message}`);
  }
  return c;
}

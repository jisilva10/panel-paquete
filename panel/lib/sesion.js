// La sesión es una cookie firmada con PANEL_CLAVE. Funciona en el borde y en Node.
const texto = new TextEncoder();

// Vercel puede guardar la clave con un salto de línea pegado: se ignoran los bordes.
export const clavePanel = () => (process.env.PANEL_CLAVE || '').trim();

export async function firma(valor) {
  const clave = clavePanel();
  if (!clave) return null;
  const k = await crypto.subtle.importKey('raw', texto.encode(clave), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const s = await crypto.subtle.sign('HMAC', k, texto.encode(valor));
  return Array.from(new Uint8Array(s)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const COOKIE = 'cuenta_panel';

export async function sesionValida(valorCookie) {
  if (!valorCookie) return false;
  const esperada = await firma('cuenta-panel-v1');
  return !!esperada && valorCookie === esperada;
}

export function base(req) {
  if (process.env.PANEL_URL) return process.env.PANEL_URL.replace(/\/$/, '');
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

// La Mac (Claude) entra con su propia llave, distinta de la clave de JIS.
export function esLaMac(req) {
  const t = process.env.PANEL_TOKEN_MAC;
  return !!t && t.length >= 32 && req.headers.get('authorization') === `Bearer ${t}`;
}

export async function autorizado(req) {
  return esLaMac(req) || (await sesionValida(req.cookies.get(COOKIE)?.value));
}

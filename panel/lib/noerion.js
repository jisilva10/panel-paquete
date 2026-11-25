// El panel de Noerion se lee desde aquí, en el servidor, con su llave (NOERION_TOKEN).
// Nunca llega al navegador: el teléfono solo ve esta dirección.
export const NOERION = process.env.NOERION_URL || 'https://panel.noerionconsulting.com';

export async function noerion(ruta, { method = 'GET', body } = {}) {
  const r = await fetch(`${NOERION}/api/${ruta}`, {
    method, cache: 'no-store',
    headers: { Authorization: `Bearer ${process.env.NOERION_TOKEN || ''}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body,
  });
  return r;
}

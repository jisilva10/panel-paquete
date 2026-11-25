// Todo se muestra en hora de Ecuador (UTC-5, sin cambio de hora).
export const ZONA = 'America/Guayaquil';

export function deInputEcuador(valor) {
  // "2026-11-28T11:00" escrito en Ecuador → instante real
  return new Date(`${valor}:00-05:00`);
}

export function aInputEcuador(fecha) {
  const d = new Date(new Date(fecha).getTime() - 5 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

export function hoyEcuador() {
  return aInputEcuador(new Date()).slice(0, 10);
}

const fmtDia = new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'short', day: 'numeric', month: 'short' });
const fmtHora = new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, hour: 'numeric', minute: '2-digit', hour12: false });

export function franja(h) {
  if (h < 6) return 'de la madrugada';
  if (h < 12) return 'de la mañana';
  if (h < 19) return 'de la tarde';
  return 'de la noche';
}

export function cuandoLargo(fecha) {
  const d = new Date(fecha);
  const h = Number(new Intl.DateTimeFormat('en-US', { timeZone: ZONA, hour: 'numeric', hour12: false }).format(d)) % 24;
  return `${fmtDia.format(d).replace('.', '')} · ${fmtHora.format(d)} ${franja(h)}`;
}

export function cuandoCorto(fecha) {
  const d = new Date(fecha);
  return `${fmtDia.format(d).replace('.', '')}, ${fmtHora.format(d)}`;
}

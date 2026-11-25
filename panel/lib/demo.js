// Solo en local (PANEL_DEMO=1): el panel se ve con funciones de ejemplo, sin base.
export const enDemo = () => process.env.PANEL_DEMO === '1' && process.env.NODE_ENV !== 'production';

export function colaDemo() {
  const h = (d) => new Date(Date.now() + d * 3600e3).toISOString();
  const base = { redes: ['instagram', 'tiktok', 'youtube'], video_url: 'https://example.com/v.mp4', estado: 'programada', ig_estado: 'pendiente', tt_estado: 'pendiente', yt_estado: 'pendiente', etiquetas: {} };
  return [
    { ...base, id: 'd1', pieza: '1. La guerra de los emús', programada_para: h(-2), estado: 'hecha', ig_estado: 'publicado', tt_estado: 'en_borradores', yt_estado: 'para_ti', texto: 'En 1932 Australia le declaró la guerra a 20.000 emús. Adivina quién ganó.\n\n#historia #australia #emus #guerra #loquenosabias' },
    { ...base, id: 'd2', pieza: '2. El panadero del Titanic', programada_para: h(5), texto: 'Sobrevivió dos horas en el agua helada… con whisky.' },
    { ...base, id: 'd3', pieza: '3. La chaqueta de Jensen Huang', programada_para: h(10), texto: '' },
  ];
}

export async function resumenDemo() {
  const d = (dias) => new Date(Date.now() - dias * 86400e3).toISOString();
  const pz = (pieza, dias, tt, ig, yt, etiquetas) => ({ pieza, fecha: d(dias), formato: 'reel', duracion: 55, etiquetas,
    tiktok: { vistas: tt, me_gusta: Math.round(tt * 0.06), fecha: d(dias) }, instagram: { vistas: ig, me_gusta: Math.round(ig * 0.05), tiempo: 21, fecha: d(dias) }, youtube: { vistas: yt, me_gusta: Math.round(yt * 0.04), fecha: d(dias) } });
  const piezas = [
    pz('6. El hombre que vendió la Torre Eiffel', 1, 3400, 1200, 900, { tipo: 'estafa', duracion: '35-45 s', gancho: 'dato imposible', cierre: 'ironía' }),
    pz('5. La chaqueta de Jensen Huang', 2, 12800, 4100, 6200, { tipo: 'tendencia', duracion: '20-30 s', gancho: 'en medio del lío', cierre: 'dato que remata' }),
    pz('4. El presidente que se perdió', 4, 2100, 800, 450, { tipo: 'política', duracion: '55-70 s', gancho: 'pregunta', cierre: 'bucle' }),
    pz('3. La chaqueta de Jensen Huang (corta)', 6, 9900, 2600, 4800, { tipo: 'tendencia', duracion: '20-30 s', gancho: 'dato imposible', cierre: 'bucle' }),
    pz('2. El panadero del Titanic', 8, 4300, 1500, 1200, { tipo: 'historia absurda', duracion: '35-45 s', gancho: 'en medio del lío', cierre: 'dato que remata' }),
    pz('1. La guerra de los emús', 10, 5200, 1900, 2300, { tipo: 'historia absurda', duracion: '55-70 s', gancho: 'dato imposible', cierre: 'dato que remata' }),
  ].map((p) => ({ ...p, numero: Number(p.pieza.split('.')[0]), retencion: 21 / 55 }));
  const serie = (a, b) => Array.from({ length: 10 }, (_, i) => ({ fecha: new Date(Date.now() - (9 - i) * 86400e3).toISOString().slice(0, 10), v: Math.round(a + ((b - a) * i) / 9) }));
  return {
    redes: {
      tiktok: { seguidores: { hoy: 412, antes: 120, serie: serie(0, 412) }, semana: 30400, semanaAntes: 9500 },
      instagram: { seguidores: { hoy: 138, antes: 60, serie: serie(0, 138) }, semana: 9800, semanaAntes: 3400 },
      youtube: { seguidores: { hoy: 95, antes: 31, serie: serie(0, 95) }, semana: 14600, semanaAntes: 3500 },
    },
    piezas,
    cola: colaDemo(),
    cuentas: { instagram: { usuario: 'cuenta.demo' }, tiktok: { usuario: 'cuenta.demo' }, youtube: { usuario: 'cuenta.demo' } },
    errores: [],
  };
}

// Todo lo que el panel muestra de un vistazo, calculado en el servidor.
import { db } from './db';
import { enDemo, resumenDemo } from './demo';

const DIA = 86400000;

export async function resumen() {
  if (enDemo()) return resumenDemo();
  const [{ data: medios }, { data: ultimas }, { data: diarias }, { data: cola }, { data: cuentas }, { data: errores }] = await Promise.all([
    db().from('medios').select('*').eq('reemplazado', false).order('publicado_en', { ascending: false }).limit(400),
    db().from('ultima_metrica').select('*').limit(2000),
    db().from('cuenta_diaria').select('*').order('fecha').limit(800),
    db().from('publicaciones').select('*').neq('estado', 'cancelada').order('programada_para', { ascending: false }).limit(30),
    db().from('cuentas').select('red,usuario,expira,refresh_expira'),
    db().from('bitacora').select('*').eq('tipo', 'error').gte('cuando', new Date(Date.now() - 3 * DIA).toISOString()).order('cuando', { ascending: false }).limit(5),
  ]);

  // Un error viejo no se muestra si después hubo una lectura de números completa y sin errores.
  const { data: lecturas } = await db().from('bitacora').select('cuando,detalle').eq('tipo', 'numeros').order('cuando', { ascending: false }).limit(1);
  const ultimaBuena = lecturas?.[0] && !/error/.test(lecturas[0].detalle || '') ? new Date(lecturas[0].cuando) : null;
  const erroresVivos = (errores || []).filter((e) => !ultimaBuena || new Date(e.cuando) > ultimaBuena);
  // Un video que salió cortado en TikTok se avisa siempre (hasta que JIS lo quite con la «×»).
  for (const c of cola || []) if (c.tt_error?.includes('quedó de')) erroresVivos.unshift({ id: `tt-corto-${c.id}`, detalle: c.tt_error });
  const num = new Map((ultimas || []).map((m) => [`${m.red}|${m.media_id}`, m]));
  const filas = (medios || []).map((m) => ({ ...m, n: num.get(`${m.red}|${m.media_id}`) || {} }))
    .filter((m) => !(m.origen === 'excel' && m.n.vistas == null));

  // Piezas: una fila por pieza con las dos redes al lado (nunca sumadas).
  const piezas = new Map();
  for (const f of filas) {
    const clave = f.pieza || `${f.red}:${f.media_id}`;
    if (!piezas.has(clave)) piezas.set(clave, { pieza: f.pieza || f.titulo || '(sin nombre)', fecha: f.publicado_en, formato: f.formato, duracion: f.duracion, publicacion_id: f.publicacion_id });
    if (f.publicacion_id && !piezas.get(clave).publicacion_id) piezas.get(clave).publicacion_id = f.publicacion_id;
    const p = piezas.get(clave);
    p[f.red] = {
      vistas: f.n.vistas ?? null, alcance: f.n.alcance ?? null, me_gusta: f.n.me_gusta ?? null, comentarios: f.n.comentarios ?? null,
      guardados: f.n.guardados ?? null, compartidos: f.n.compartidos ?? null, seguidores: f.n.seguidores_ganados ?? null,
      tiempo: f.n.tiempo_promedio_s ?? null, permalink: f.permalink, fecha: f.publicado_en, leido: f.n.fecha ?? null,
    };
    if (!p.duracion && f.duracion) p.duracion = f.duracion;
    if (f.publicado_en && new Date(f.publicado_en) < new Date(p.fecha)) p.fecha = f.publicado_en;
  }
  const lista = [...piezas.values()].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  for (const p of lista) {
    p.numero = Number((p.pieza.match(/^(?:Carrusel\s+)?(\d+)/i) || [])[1]) || null;
    const i = p.instagram;
    p.retencion = i?.tiempo && p.duracion ? i.tiempo / p.duracion : null;
    p.guardadosMil = i?.vistas ? (1000 * (i.guardados || 0)) / i.vistas : null;
  }

  // Semana contra semana: vistas de lo que salió en cada ventana, por red.
  const ventana = (red, desdeDias, hastaDias, campo = 'vistas') => filas
    .filter((f) => f.red === red && f.publicado_en)
    .filter((f) => { const d = (Date.now() - new Date(f.publicado_en)) / DIA; return d >= hastaDias && d < desdeDias; })
    .reduce((s, f) => s + (Number(f.n[campo]) || 0), 0);
  const likes = (red) => ({ likes: ventana(red, 7, 0, 'me_gusta'), likesAntes: ventana(red, 14, 7, 'me_gusta') });

  const seguidores = (red) => {
    const s = (diarias || []).filter((d) => d.red === red && d.seguidores != null);
    const ultimo = s.at(-1);
    const hace7 = [...s].reverse().find((d) => (new Date(ultimo?.fecha) - new Date(d.fecha)) / DIA >= 7);
    return { hoy: ultimo?.seguidores ?? null, antes: hace7?.seguidores ?? null, serie: s.map((d) => ({ fecha: d.fecha, v: Number(d.seguidores) })) };
  };

  return {
    redes: {
      instagram: { seguidores: seguidores('instagram'), semana: ventana('instagram', 7, 0), semanaAntes: ventana('instagram', 14, 7), vistas7d: (diarias || []).filter((d) => d.red === 'instagram').at(-1)?.vistas_7d ?? null, ...likes('instagram') },
      tiktok: { seguidores: seguidores('tiktok'), semana: ventana('tiktok', 7, 0), semanaAntes: ventana('tiktok', 14, 7), ...likes('tiktok') },
      youtube: { seguidores: seguidores('youtube'), semana: ventana('youtube', 7, 0), semanaAntes: ventana('youtube', 14, 7), ...likes('youtube') },
    },
    piezas: lista.slice(0, 120),
    cola: (cola || []).sort((a, b) => new Date(a.programada_para) - new Date(b.programada_para)),
    cuentas: Object.fromEntries((cuentas || []).map((c) => [c.red, c])),
    errores: erroresVivos,
  };
}

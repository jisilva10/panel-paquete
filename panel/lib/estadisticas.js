import { db, anotar } from './db';
import { tokenDe } from './cuentas';
import { hoyEcuador } from './tiempo';
import * as ig from './instagram';
import * as tt from './tiktok';
import * as yt from './youtube';

const DIA = 86400000;

// Une lo que trae la API con la función de la cola (misma red, ±1,5 días).
async function vincular(red, media_id, publicado_en) {
  const { data: m } = await db().from('medios').select('pieza,duracion').eq('red', red).eq('media_id', media_id).maybeSingle();
  if (m?.pieza) return;
  const t = new Date(publicado_en).getTime();
  const desde = new Date(t - 1.5 * DIA).toISOString();
  const hasta = new Date(t + 1.5 * DIA).toISOString();
  const { data: excel } = await db().from('medios').select('media_id,pieza,duracion,publicado_en')
    .eq('red', red).eq('origen', 'excel').eq('reemplazado', false).gte('publicado_en', desde).lte('publicado_en', hasta);
  const { data: cola } = await db().from('publicaciones').select('id,pieza,duracion,programada_para')
    .gte('programada_para', desde).lte('programada_para', hasta);
  const cerca = (lista, campo) => (lista || []).sort((a, b) => Math.abs(new Date(a[campo]) - t) - Math.abs(new Date(b[campo]) - t))[0];
  const deCola = cerca(cola, 'programada_para');
  const deExcel = cerca(excel, 'publicado_en');
  const elegido = deCola || deExcel;
  if (!elegido) return;
  await db().from('medios').update({ pieza: elegido.pieza, duracion: elegido.duracion, publicacion_id: deCola?.id ?? null })
    .eq('red', red).eq('media_id', media_id);
  if (deExcel) await db().from('medios').update({ reemplazado: true }).eq('red', red).eq('media_id', deExcel.media_id);
}

async function leerInstagram() {
  const c = await tokenDe('instagram');
  if (!c) return 'sin conectar';
  const t = c.access_token;
  const fecha = hoyEcuador();
  const yo = await ig.cuenta(t);
  const semana = await ig.cuentaSemana(t);
  await db().from('cuenta_diaria').upsert({ red: 'instagram', fecha, seguidores: yo.followers_count, vistas_7d: semana.views, alcance_7d: semana.reach, leido_en: new Date().toISOString() });
  const lista = await ig.medios(t, 40);
  for (const m of lista) {
    const formato = m.media_product_type === 'REELS' ? 'reel' : m.media_type === 'CAROUSEL_ALBUM' ? 'carrusel' : 'post';
    await db().from('medios').upsert({ red: 'instagram', media_id: m.id, titulo: (m.caption || '').split('\n')[0].slice(0, 140), formato, publicado_en: m.timestamp, permalink: m.permalink, origen: 'api' }, { onConflict: 'red,media_id', ignoreDuplicates: false });
    // Solo se vuelven a leer los de los últimos 60 días: lo viejo ya no se mueve.
    if (Date.now() - new Date(m.timestamp).getTime() > 60 * DIA) continue;
    const n = await ig.numerosDe(t, m);
    await db().from('metricas').upsert({ red: 'instagram', media_id: m.id, fecha, ...n, leido_en: new Date().toISOString() });
    await vincular('instagram', m.id, m.timestamp);
  }
  return `${lista.length} piezas`;
}

// El 003 salió en TikTok de 16 s en vez de 55 (26/11/2026). Si lo que dice TikTok es bastante más corto que el
// video que se mandó, queda anotado en la publicación (tt_error) y el panel lo muestra en rojo.
async function revisarLargo(v) {
  if (!v.duration) return;
  const { data: m } = await db().from('medios').select('publicacion_id').eq('red', 'tiktok').eq('media_id', String(v.id)).maybeSingle();
  if (!m?.publicacion_id) return;
  const { data: p } = await db().from('publicaciones').select('id,pieza,duracion,tt_error').eq('id', m.publicacion_id).maybeSingle();
  const debe = Number(p?.duracion);
  if (!debe || p.tt_error || Number(v.duration) >= debe - 3) return;
  const msg = `TikTok: «${p.pieza}» quedó de ${Math.round(v.duration)} s y el video dura ${Math.round(debe)} s. Bórralo en TikTok y vuelve a subirlo entero.`;
  await db().from('publicaciones').update({ tt_error: msg }).eq('id', p.id);
  await anotar('error', msg);
}

async function leerTikTok() {
  const c = await tokenDe('tiktok');
  if (!c) return 'sin conectar';
  const t = c.access_token;
  const fecha = hoyEcuador();
  const yo = await tt.usuario(t);
  await db().from('cuenta_diaria').upsert({ red: 'tiktok', fecha, seguidores: yo.follower_count, leido_en: new Date().toISOString() });
  if (yo.username && yo.username !== c.usuario) await db().from('cuentas').update({ usuario: yo.username }).eq('red', 'tiktok');
  const lista = await tt.videos(t, 60);
  for (const v of lista) {
    const publicado = new Date(v.create_time * 1000).toISOString();
    await db().from('medios').upsert({ red: 'tiktok', media_id: String(v.id), titulo: (v.title || v.video_description || '').split('\n')[0].slice(0, 140), formato: 'reel', publicado_en: publicado, permalink: v.share_url, origen: 'api' });
    if (v.duration) await db().from('medios').update({ duracion: v.duration }).eq('red', 'tiktok').eq('media_id', String(v.id)).is('duracion', null);
    await db().from('metricas').upsert({ red: 'tiktok', media_id: String(v.id), fecha, vistas: v.view_count, me_gusta: v.like_count, comentarios: v.comment_count, compartidos: v.share_count, leido_en: new Date().toISOString() });
    await vincular('tiktok', String(v.id), publicado);
    await revisarLargo(v);
  }
  return `${lista.length} piezas`;
}

async function leerYouTube() {
  if (!yt.listo()) return 'sin llave';
  const fecha = hoyEcuador();
  const c = await yt.canal();
  await db().from('cuenta_diaria').upsert({ red: 'youtube', fecha, seguidores: c.seguidores, leido_en: new Date().toISOString() });
  // Sin pisar la conexión para subir (si la hay): solo se actualiza el nombre; la fila se crea con una llave de mentira.
  const usuario = (c.usuario || c.titulo || '').replace(/^@/, '');
  const { data: ya } = await db().from('cuentas').select('red').eq('red', 'youtube').maybeSingle();
  if (ya) await db().from('cuentas').update({ cuenta_id: process.env.YT_CANAL, usuario, actualizado: new Date().toISOString() }).eq('red', 'youtube');
  else await db().from('cuentas').insert({ red: 'youtube', cuenta_id: process.env.YT_CANAL, usuario, access_token: 'llave-de-google', actualizado: new Date().toISOString() });
  const lista = await yt.videos(c.subidas, 50);
  for (const v of lista) {
    await db().from('medios').upsert({ red: 'youtube', media_id: v.id, titulo: v.titulo.slice(0, 140), formato: 'reel', publicado_en: v.publicado, permalink: v.permalink, duracion: v.duracion, origen: 'api' });
    await db().from('metricas').upsert({ red: 'youtube', media_id: v.id, fecha, vistas: v.vistas, me_gusta: v.me_gusta, comentarios: v.comentarios, leido_en: new Date().toISOString() });
    await vincular('youtube', v.id, v.publicado);
  }
  return `${lista.length} piezas`;
}

export async function leerTodo() {
  const fuera = {};
  for (const [red, f] of [['instagram', leerInstagram], ['tiktok', leerTikTok], ['youtube', leerYouTube]]) {
    try { fuera[red] = await f(); }
    catch (e) { fuera[red] = `error: ${e.message}`; await anotar('error', `Números de ${red}: ${e.message}`); }
  }
  await anotar('numeros', fuera);
  return fuera;
}

import { del } from '@vercel/blob';
import { db, anotar } from './db';
import { tokenDe } from './cuentas';
import * as ig from './instagram';
import * as tt from './tiktok';
import * as yt from './youtube';

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const ahora = () => new Date().toISOString();
const FIN_IG = ['publicado', 'error', 'no_va'];
const FIN_TT = ['en_borradores', 'publicado', 'error', 'no_va'];
const FIN_YT = ['para_ti', 'publicado', 'error', 'no_va'];

async function cambiar(id, campos, si) {
  let q = db().from('publicaciones').update(campos).eq('id', id);
  for (const [k, v] of Object.entries(si || {})) q = q.eq(k, v);
  const { data } = await q.select();
  return data?.[0] || null;
}

// Si una corrida murió a la mitad, la siguiente lo vuelve a intentar.
async function destrabar() {
  const hace = (min) => new Date(Date.now() - min * 60000).toISOString();
  await db().from('publicaciones').update({ ig_estado: 'pendiente' }).eq('ig_estado', 'creando').lt('ig_desde', hace(10));
  await db().from('publicaciones').update({ tt_estado: 'pendiente' }).eq('tt_estado', 'subiendo').lt('tt_desde', hace(15));
  await db().from('publicaciones').update({ yt_estado: 'pendiente' }).eq('yt_estado', 'subiendo').lt('yt_desde', hace(20));
}

async function pasoInstagram(p, token) {
  if (p.ig_estado === 'pendiente') {
    const tomada = await cambiar(p.id, { ig_estado: 'creando', ig_desde: ahora() }, { ig_estado: 'pendiente' });
    if (!tomada) return;
    try {
      const contenedor = await ig.crearContenedor(token, { video_url: p.video_url, texto: p.texto, portada: p.portada_url });
      p = await cambiar(p.id, { ig_estado: 'procesando', ig_contenedor: contenedor, ig_error: null });
    } catch (e) {
      await cambiar(p.id, { ig_estado: 'error', ig_error: e.message });
      await anotar('error', `IG ${p.pieza}: ${e.message}`);
      return;
    }
  }
  if (p.ig_estado !== 'procesando') return;
  // Instagram tarda en procesar el video: se espera hasta ~2 min, y si no, la próxima corrida.
  for (let i = 0; i < 12; i++) {
    const s = await ig.estadoContenedor(token, p.ig_contenedor).catch((e) => ({ status_code: 'CONSULTA', status: e.message }));
    if (s.status_code === 'FINISHED') {
      try {
        const media = await ig.publicarContenedor(token, p.ig_contenedor);
        await cambiar(p.id, { ig_estado: 'publicado', ig_media_id: media, ig_error: null });
        await db().from('medios').upsert({ red: 'instagram', media_id: media, pieza: p.pieza, titulo: p.texto?.split('\n')[0]?.slice(0, 140), formato: 'reel', publicado_en: ahora(), duracion: p.duracion, publicacion_id: p.id });
        await anotar('publicado', `Instagram · ${p.pieza}`);
      } catch (e) {
        await cambiar(p.id, { ig_estado: 'error', ig_error: e.message });
        await anotar('error', `IG ${p.pieza}: ${e.message}`);
      }
      return;
    }
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
      await cambiar(p.id, { ig_estado: 'error', ig_error: `Instagram no aceptó el video: ${s.status || s.status_code}` });
      return;
    }
    await espera(10000);
  }
}

async function pasoTikTok(p, token) {
  if (p.tt_estado === 'pendiente') {
    const tomada = await cambiar(p.id, { tt_estado: 'subiendo', tt_desde: ahora() }, { tt_estado: 'pendiente' });
    if (!tomada) return;
    try {
      let id;
      // Publicación directa: solo con el interruptor prendido Y si JIS aprobó este video en el panel.
      if (tt.directo() && p.tt_aprobacion?.consentimiento) {
        const info = await tt.infoCreador(token); // TikTok pide revisarlo justo antes de publicar
        id = await tt.publicarDirecto(token, p.video_url, Number(p.video_bytes), tt.postInfo(p.tt_aprobacion, info, Number(p.duracion)));
      } else {
        id = await tt.subirABorradores(token, p.video_url, Number(p.video_bytes));
      }
      p = await cambiar(p.id, { tt_estado: 'en_tiktok', tt_publish_id: id, tt_error: null });
      await anotar('subido', `TikTok · ${p.pieza}`);
    } catch (e) {
      await cambiar(p.id, { tt_estado: 'error', tt_error: e.message });
      await anotar('error', `TikTok ${p.pieza}: ${e.message}`);
      return;
    }
  }
  if (p.tt_estado === 'en_tiktok') {
    for (let i = 0; i < 6; i++) {
      if (await revisarTikTok(p, token)) return;
      await espera(5000);
    }
  }
}

// true si ya llegó a un estado final de esta corrida.
async function revisarTikTok(p, token) {
  const s = await tt.estadoSubida(token, p.tt_publish_id).catch(() => null);
  if (!s) return false;
  if (s.status === 'SEND_TO_USER_INBOX' && p.tt_estado !== 'en_borradores') {
    await cambiar(p.id, { tt_estado: 'en_borradores' });
    return true;
  }
  if (s.status === 'PUBLISH_COMPLETE') {
    const vid = s.publicaly_available_post_id?.[0] ? String(s.publicaly_available_post_id[0]) : null;
    await cambiar(p.id, { tt_estado: 'publicado', tt_video_id: vid });
    if (vid) await db().from('medios').upsert({ red: 'tiktok', media_id: vid, pieza: p.pieza, formato: 'reel', publicado_en: ahora(), duracion: p.duracion, publicacion_id: p.id });
    return true;
  }
  if (s.status === 'FAILED') {
    await cambiar(p.id, { tt_estado: 'error', tt_error: `TikTok: ${s.fail_reason || 'falló'}` });
    return true;
  }
  return false;
}

// YouTube: con el interruptor apagado (o sin conectar para subir) aparece la tarjeta «Subir», como siempre.
// Prendido y conectado: se sube solo con videos.insert, con la privacidad que tenga la función (público por defecto).
async function pasoYouTube(p, apurado) {
  const c = yt.subirSolo() ? await tokenDe('youtube') : null;
  if (!yt.conectadaParaSubir(c)) {
    await cambiar(p.id, { yt_estado: 'para_ti' }, { yt_estado: 'pendiente' });
    await anotar('para_ti', `YouTube · ${p.pieza}`);
    return;
  }
  if (apurado) return; // poco tiempo en esta corrida: lo sube la siguiente (en 5 min)
  const tomada = await cambiar(p.id, { yt_estado: 'subiendo', yt_desde: ahora() }, { yt_estado: 'pendiente' });
  if (!tomada) return;
  try {
    const id = await yt.subirVideo(c.access_token, { videoUrl: p.video_url, bytes: Number(p.video_bytes), texto: p.texto, privacidad: p.yt_privacidad });
    const url = `https://youtube.com/shorts/${id}`;
    await cambiar(p.id, { yt_estado: 'publicado', yt_video_id: id, yt_url: url, yt_error: null });
    await db().from('medios').upsert({ red: 'youtube', media_id: id, pieza: p.pieza, titulo: p.texto?.split('\n')[0]?.slice(0, 140), formato: 'reel', publicado_en: ahora(), duracion: p.duracion, permalink: url, publicacion_id: p.id });
    await anotar('publicado', `YouTube · ${p.pieza}`);
  } catch (e) {
    await cambiar(p.id, { yt_estado: 'error', yt_error: e.message });
    await anotar('error', `YouTube ${p.pieza}: ${e.message}`);
  }
}

async function cerrar(id) {
  const { data: p } = await db().from('publicaciones').select('*').eq('id', id).single();
  const igListo = !p.redes.includes('instagram') || FIN_IG.includes(p.ig_estado);
  const ttListo = !p.redes.includes('tiktok') || FIN_TT.includes(p.tt_estado);
  const ytListo = !p.redes.includes('youtube') || FIN_YT.includes(p.yt_estado);
  if (!igListo || !ttListo || !ytListo) return;
  const huboError = p.ig_estado === 'error' || p.tt_estado === 'error' || p.yt_estado === 'error';
  await cambiar(p.id, { estado: huboError ? 'con_error' : 'hecha' });
}

// El video se borra del almacén cuando ya está en todas las redes (YouTube y TikTok los publica él).
async function limpiar() {
  const { data } = await db().from('publicaciones').select('*').not('video_url', 'is', null).in('estado', ['hecha']).limit(20);
  for (const p of data || []) {
    const tt = !p.redes.includes('tiktok') || ['publicado', 'no_va'].includes(p.tt_estado);
    const yt = !p.redes.includes('youtube') || ['publicado', 'no_va'].includes(p.yt_estado);
    if (!tt || !yt) continue;
    try { await del(p.video_url); if (p.portada_url) await del(p.portada_url); await cambiar(p.id, { video_url: null, portada_url: null }); } catch {}
  }
}

export async function correrCola() {
  const inicio = Date.now();
  await destrabar();
  const { data: cola } = await db().from('publicaciones').select('*')
    .in('estado', ['programada', 'en_curso']).lte('programada_para', ahora())
    .order('programada_para').limit(3);
  const hechas = [];
  for (let p of cola || []) {
    if (p.estado === 'programada') p = await cambiar(p.id, { estado: 'en_curso' });
    if (p.redes.includes('instagram') && !FIN_IG.includes(p.ig_estado)) {
      const c = await tokenDe('instagram');
      if (c) await pasoInstagram(p, c.access_token);
      else await cambiar(p.id, { ig_estado: 'error', ig_error: 'Instagram no está conectado' });
    }
    const { data: p2 } = await db().from('publicaciones').select('*').eq('id', p.id).single();
    if (p2.redes.includes('tiktok') && !FIN_TT.includes(p2.tt_estado)) {
      const c = await tokenDe('tiktok');
      if (c) await pasoTikTok(p2, c.access_token);
      else await cambiar(p.id, { tt_estado: 'error', tt_error: 'TikTok no está conectado' });
    }
    // YouTube: a la hora, la tarjeta para subirlo él (o, con YT_SUBIR_SOLO=1 y la cuenta conectada, sale solo).
    const { data: p3 } = await db().from('publicaciones').select('*').eq('id', p.id).single();
    if (p3.redes.includes('youtube') && p3.yt_estado === 'pendiente') await pasoYouTube(p3, Date.now() - inicio > 150000);
    await cerrar(p.id);
    hechas.push(p.pieza);
  }
  // Los que esperan en borradores: ¿ya los publicó?
  const { data: borradores } = await db().from('publicaciones').select('*').eq('tt_estado', 'en_borradores').limit(10);
  if (borradores?.length) {
    const c = await tokenDe('tiktok');
    if (c) for (const p of borradores) await revisarTikTok(p, c.access_token);
  }
  await limpiar();
  return { revisadas: hechas };
}

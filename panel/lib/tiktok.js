// TikTok: Login Kit + Display API (números) + Content Posting API.
// Hoy: el video llega a los borradores (Upload, video.upload) y JIS toca «Publicar».
// Publicación directa (Direct Post, video.publish): detrás del interruptor TT_DIRECTO=1, y solo para los
// videos que JIS aprobó en el panel con la pantalla que exige TikTok (Content Sharing Guidelines). Sin
// aprobación, aunque el interruptor esté prendido, el video va a borradores como siempre.
const API = 'https://open.tiktokapis.com/v2';
export const directo = () => process.env.TT_DIRECTO === '1';
// video.publish solo se pide con el interruptor prendido (si la app no lo tiene aprobado, TikTok rechaza la conexión).
export const PERMISOS_TT = () => 'user.info.basic,user.info.profile,user.info.stats,video.list,video.upload' + (directo() ? ',video.publish' : '');
export const PRIVACIDAD_TT = {
  PUBLIC_TO_EVERYONE: 'Todo el mundo',
  MUTUAL_FOLLOW_FRIENDS: 'Amigos (se siguen mutuamente)',
  FOLLOWER_OF_CREATOR: 'Seguidores',
  SELF_ONLY: 'Solo yo',
};

async function leer(r) {
  const j = await r.json().catch(() => ({}));
  const err = j.error && j.error.code && j.error.code !== 'ok' ? j.error : null;
  if (!r.ok || err || j.error_description) {
    throw new Error(`TikTok: ${err?.message || j.error_description || j.message || r.status}${err?.code ? ' (' + err.code + ')' : ''}`);
  }
  return j;
}

export function urlAutorizar(redirect, state) {
  const p = new URLSearchParams({
    client_key: process.env.TT_CLIENT_KEY?.trim(),
    scope: PERMISOS_TT(),
    response_type: 'code',
    redirect_uri: redirect,
    state,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${p}`;
}

function guardar(j) {
  return {
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expira: new Date(Date.now() + (j.expires_in || 7200) * 1000).toISOString(),
    refresh_expira: new Date(Date.now() + (j.refresh_expires_in || 15552000) * 1000).toISOString(),
    cuenta_id: j.open_id,
  };
}

async function token(params) {
  const body = new URLSearchParams({ client_key: process.env.TT_CLIENT_KEY?.trim(), client_secret: process.env.TT_CLIENT_SECRET?.trim(), ...params });
  return leer(await fetch(`${API}/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
    body,
  }));
}

export async function canjearCodigo(code, redirect) {
  const t = guardar(await token({ code, grant_type: 'authorization_code', redirect_uri: redirect }));
  const u = await usuario(t.access_token).catch(() => ({}));
  return { ...t, usuario: u.username || u.display_name || null };
}

export async function refrescar(refresh) {
  // TikTok devuelve un refresh_token NUEVO cada vez: hay que guardarlo.
  return guardar(await token({ grant_type: 'refresh_token', refresh_token: refresh }));
}

export async function usuario(t) {
  const f = 'open_id,display_name,username,avatar_url,follower_count,following_count,likes_count,video_count';
  const j = await leer(await fetch(`${API}/user/info/?fields=${f}`, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' }));
  return j.data?.user || {};
}

export async function videos(t, maximo = 60) {
  const f = 'id,title,video_description,duration,share_url,create_time,view_count,like_count,comment_count,share_count';
  let cursor;
  const todos = [];
  while (todos.length < maximo) {
    const j = await leer(await fetch(`${API}/video/list/?fields=${f}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    }));
    todos.push(...(j.data?.videos || []));
    if (!j.data?.has_more) break;
    cursor = j.data.cursor;
  }
  return todos;
}

// ── Subida a borradores (FILE_UPLOAD, por trozos leídos del Blob) ──
// TikTok: si el video va en un solo trozo, chunk_size tiene que ser el video entero (si no, «The chunk size is invalid»).
// Un trozo puede pesar hasta 64 MB; arriba de eso, trozos de 10 MB (el último se lleva lo que sobra, hasta 20 MB).
const ENTERO = 64 * 1024 * 1024;
const TROZO = 10 * 1024 * 1024;

export function planTrozos(bytes) {
  const chunk = bytes <= ENTERO ? bytes : TROZO;
  const total = Math.floor(bytes / chunk);
  return { chunk, total };
}

export async function subirABorradores(t, videoUrl, bytes) {
  return iniciarYSubir(t, '/post/publish/inbox/video/init/', {}, videoUrl, bytes);
}

// Direct Post: post_info sale de lo que JIS aprobó (privacidad, comentarios, dúo, stitch, divulgación comercial, IA).
export async function publicarDirecto(t, videoUrl, bytes, post_info) {
  return iniciarYSubir(t, '/post/publish/video/init/', { post_info }, videoUrl, bytes);
}

// Lo que TikTok dice del creador justo ahora: apodo, opciones de privacidad, qué tiene apagado y el largo máximo.
// Si hoy no puede publicar (spam_risk_too_many_posts, reached_active_user_cap…) leer() lanza el error con su código.
export async function infoCreador(t) {
  const j = await leer(await fetch(`${API}/post/publish/creator_info/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json; charset=UTF-8' },
    cache: 'no-store',
  }));
  return j.data || {};
}

// Arma el post_info con la aprobación guardada y revisa que siga valiendo con lo que TikTok dice AHORA.
export function postInfo(a, info, duracion) {
  if (!a?.consentimiento) throw new Error('Falta el consentimiento');
  if (!(info.privacy_level_options || []).includes(a.privacy_level)) throw new Error(`TikTok ya no ofrece «${PRIVACIDAD_TT[a.privacy_level] || a.privacy_level}» para esta cuenta: vuelve a aprobarlo`);
  if (a.divulgar && !a.brand_organic_toggle && !a.brand_content_toggle) throw new Error('Si el video promociona algo, hay que decir si es tu marca, contenido de marca o ambos');
  if (a.divulgar && a.brand_content_toggle && a.privacy_level === 'SELF_ONLY') throw new Error('El contenido de marca no puede ser privado');
  if (info.max_video_post_duration_sec && duracion && duracion > info.max_video_post_duration_sec) throw new Error(`El video dura ${Math.round(duracion)} s y esta cuenta permite hasta ${info.max_video_post_duration_sec} s`);
  return {
    title: String(a.title || '').slice(0, 2200),
    privacy_level: a.privacy_level,
    disable_comment: info.comment_disabled ? true : !a.permitir_comentarios,
    disable_duet: info.duet_disabled ? true : !a.permitir_duo,
    disable_stitch: info.stitch_disabled ? true : !a.permitir_stitch,
    brand_content_toggle: Boolean(a.divulgar && a.brand_content_toggle),
    brand_organic_toggle: Boolean(a.divulgar && a.brand_organic_toggle),
    is_aigc: Boolean(a.is_aigc),
  };
}

async function iniciarYSubir(t, ruta, extra, videoUrl, bytes) {
  const { chunk, total } = planTrozos(bytes);
  const ini = await leer(await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ ...extra, source_info: { source: 'FILE_UPLOAD', video_size: bytes, chunk_size: chunk, total_chunk_count: total } }),
  }));
  const { publish_id, upload_url } = ini.data;
  for (let i = 0; i < total; i++) {
    const a = i * chunk;
    const b = i === total - 1 ? bytes - 1 : a + chunk - 1; // el último se lleva lo que sobra
    const pedazo = await fetch(videoUrl, { headers: { Range: `bytes=${a}-${b}` } });
    if (pedazo.status !== 206 && !(pedazo.status === 200 && total === 1)) throw new Error(`No pude leer el video (${pedazo.status})`);
    const cuerpo = Buffer.from(await pedazo.arrayBuffer());
    let r;
    for (let intento = 0; intento < 3; intento++) {
      r = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(cuerpo.length), 'Content-Range': `bytes ${a}-${b}/${bytes}` },
        body: cuerpo,
      });
      if (r.status < 500) break;
    }
    if (![200, 201, 206].includes(r.status)) throw new Error(`TikTok rechazó el trozo ${i + 1}/${total} (${r.status})`);
  }
  return publish_id;
}

export async function estadoSubida(t, publish_id) {
  const j = await leer(await fetch(`${API}/post/publish/status/fetch/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ publish_id }),
  }));
  return j.data || {}; // status: PROCESSING_UPLOAD · SEND_TO_USER_INBOX · PUBLISH_COMPLETE · FAILED
}

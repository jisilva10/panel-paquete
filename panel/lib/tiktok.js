// TikTok: Login Kit + Display API (números) + Content Posting API (subida a borradores).
// TikTok no permite que una herramienta propia publique en público: el video
// llega a la bandeja de TikTok y JIS toca «Publicar». Docs: developers.tiktok.com
const API = 'https://open.tiktokapis.com/v2';
export const PERMISOS_TT = 'user.info.basic,user.info.profile,user.info.stats,video.list,video.upload';

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
    scope: PERMISOS_TT,
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
const TROZO = 20 * 1024 * 1024;

export function planTrozos(bytes) {
  const chunk = bytes <= TROZO ? bytes : TROZO;
  const total = Math.floor(bytes / chunk);
  return { chunk, total };
}

export async function subirABorradores(t, videoUrl, bytes) {
  const { chunk, total } = planTrozos(bytes);
  const ini = await leer(await fetch(`${API}/post/publish/inbox/video/init/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ source_info: { source: 'FILE_UPLOAD', video_size: bytes, chunk_size: chunk, total_chunk_count: total } }),
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

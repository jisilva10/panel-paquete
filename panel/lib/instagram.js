// Instagram API con inicio de sesión de Instagram (no necesita página de Facebook).
// Docs: developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
const V = process.env.IG_GRAPH_VERSION || 'v24.0';
const G = `https://graph.instagram.com/${V}`;
export const PERMISOS_IG = 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_insights';

async function leer(r) {
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const e = j.error || {};
    throw new Error(`Instagram: ${e.message || e.error_message || r.status}${e.error_user_msg ? ' · ' + e.error_user_msg : ''}`);
  }
  return j;
}

async function get(ruta, params, token) {
  const q = new URLSearchParams({ ...params, access_token: token });
  return leer(await fetch(`${G}${ruta}?${q}`, { cache: 'no-store' }));
}

async function post(ruta, params, token) {
  const body = new URLSearchParams({ ...params, access_token: token });
  return leer(await fetch(`${G}${ruta}`, { method: 'POST', body }));
}

export function urlAutorizar(redirect, state) {
  const p = new URLSearchParams({
    client_id: process.env.IG_APP_ID?.trim(),
    redirect_uri: redirect,
    response_type: 'code',
    scope: PERMISOS_IG,
    state,
    enable_fb_login: '0',
    force_authentication: '1',
  });
  return `https://www.instagram.com/oauth/authorize?${p}`;
}

export async function canjearCodigo(code, redirect) {
  const form = new URLSearchParams({
    client_id: process.env.IG_APP_ID?.trim(),
    client_secret: process.env.IG_APP_SECRET?.trim(),
    grant_type: 'authorization_code',
    redirect_uri: redirect,
    code: code.replace(/#_$/, ''),
  });
  const corto = await leer(await fetch('https://api.instagram.com/oauth/access_token', { method: 'POST', body: form }));
  const q = new URLSearchParams({ grant_type: 'ig_exchange_token', client_secret: process.env.IG_APP_SECRET?.trim(), access_token: corto.access_token });
  const largo = await leer(await fetch(`https://graph.instagram.com/access_token?${q}`));
  const yo = await get('/me', { fields: 'user_id,username' }, largo.access_token);
  return {
    access_token: largo.access_token,
    expira: new Date(Date.now() + (largo.expires_in || 5184000) * 1000).toISOString(),
    cuenta_id: String(yo.user_id || yo.id),
    usuario: yo.username,
  };
}

export async function refrescar(token) {
  const q = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: token });
  const j = await leer(await fetch(`https://graph.instagram.com/refresh_access_token?${q}`));
  return { access_token: j.access_token, expira: new Date(Date.now() + (j.expires_in || 5184000) * 1000).toISOString() };
}

// ── Publicar un reel: contenedor → esperar → publicar ──
export async function crearContenedor(token, { video_url, texto, portada }) {
  const datos = { media_type: 'REELS', video_url, caption: texto || '', share_to_feed: 'true' };
  if (portada) datos.cover_url = portada; // la portada sale de una escena del video
  const j = await post('/me/media', datos, token);
  return j.id;
}

export async function estadoContenedor(token, id) {
  return get(`/${id}`, { fields: 'status_code,status' }, token); // IN_PROGRESS · FINISHED · ERROR · EXPIRED · PUBLISHED
}

export async function publicarContenedor(token, id) {
  const j = await post('/me/media_publish', { creation_id: id }, token);
  return j.id;
}

// ── Números ──
export async function cuenta(token) {
  return get('/me', { fields: 'user_id,username,followers_count,media_count' }, token);
}

export async function cuentaSemana(token) {
  const hasta = Math.floor(Date.now() / 1000);
  const desde = hasta - 7 * 86400;
  const fuera = {};
  for (const m of ['views', 'reach']) {
    try {
      const j = await get('/me/insights', { metric: m, period: 'day', metric_type: 'total_value', since: desde, until: hasta }, token);
      fuera[m] = j.data?.[0]?.total_value?.value ?? null;
    } catch { fuera[m] = null; }
  }
  return fuera;
}

export async function medios(token, cuantos = 40) {
  const j = await get('/me/media', {
    fields: 'id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count',
    limit: String(cuantos),
  }, token);
  return j.data || [];
}

const METRICAS_REEL = ['views', 'reach', 'saved', 'shares', 'likes', 'comments', 'ig_reels_avg_watch_time'];
const METRICAS_POST = ['views', 'reach', 'saved', 'shares', 'likes', 'comments'];

export async function numerosDe(token, m) {
  const lista = m.media_product_type === 'REELS' ? METRICAS_REEL : METRICAS_POST;
  const fuera = {};
  // Una por una: si Instagram rechaza una métrica, las demás siguen.
  try {
    const j = await get(`/${m.id}/insights`, { metric: lista.join(',') }, token);
    for (const d of j.data || []) fuera[d.name] = d.values?.[0]?.value ?? d.total_value?.value ?? null;
  } catch {
    for (const metrica of lista) {
      try {
        const j = await get(`/${m.id}/insights`, { metric: metrica }, token);
        fuera[metrica] = j.data?.[0]?.values?.[0]?.value ?? null;
      } catch {}
    }
  }
  return {
    vistas: fuera.views ?? null,
    alcance: fuera.reach ?? null,
    me_gusta: fuera.likes ?? m.like_count ?? null,
    comentarios: fuera.comments ?? m.comments_count ?? null,
    guardados: fuera.saved ?? null,
    compartidos: fuera.shares ?? null,
    tiempo_promedio_s: fuera.ig_reels_avg_watch_time != null ? fuera.ig_reels_avg_watch_time / 1000 : null,
  };
}

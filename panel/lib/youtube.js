// YouTube, dos cosas separadas:
// 1) Números públicos del canal con una llave de Google (YT_API_KEY) y el id del canal (YT_CANAL). Sin conectar nada.
// 2) Subir Shorts solos: conexión OAuth con el permiso youtube.upload (YT_CLIENT_ID / YT_CLIENT_SECRET, en Vercel)
//    y la subida reanudable de videos.insert. Va detrás del interruptor YT_SUBIR_SOLO=1 (apagado: sigue la tarjeta «Subir»).
//    Desde el 2/11/2026 Google ya no deja privadas las subidas de proyectos sin auditar (revision_history de la Data API v3).
const API = 'https://www.googleapis.com/youtube/v3';
const SUBIDA = 'https://www.googleapis.com/upload/youtube/v3/videos';
const OAUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN = 'https://oauth2.googleapis.com/token';
export const PERMISO_YT = 'https://www.googleapis.com/auth/youtube.upload';
export const PRIVACIDADES = ['public', 'unlisted', 'private'];

async function get(ruta, q) {
  const u = new URL(API + ruta);
  for (const [k, v] of Object.entries({ ...q, key: process.env.YT_API_KEY })) u.searchParams.set(k, v);
  const r = await fetch(u, { cache: 'no-store' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `YouTube ${r.status}`);
  return j;
}

export const listo = () => Boolean(process.env.YT_API_KEY && process.env.YT_CANAL);
export const oauthListo = () => Boolean(process.env.YT_CLIENT_ID?.trim() && process.env.YT_CLIENT_SECRET?.trim());
// El interruptor: solo con YT_SUBIR_SOLO=1 el reloj sube a YouTube. Apagado, a la hora sale la tarjeta «Subir».
export const subirSolo = () => process.env.YT_SUBIR_SOLO === '1';
// La fila «youtube» de cuentas existe siempre (la escriben los números); está conectada para subir si tiene llave larga.
export const conectadaParaSubir = (c) => Boolean(c?.refresh_token);

export async function canal() {
  const j = await get('/channels', { part: 'statistics,contentDetails,snippet', id: process.env.YT_CANAL });
  const c = j.items?.[0];
  if (!c) throw new Error('No encuentro el canal (revisa YT_CANAL)');
  return { titulo: c.snippet.title, usuario: c.snippet.customUrl, seguidores: Number(c.statistics.subscriberCount), subidas: c.contentDetails.relatedPlaylists.uploads };
}

// Los últimos videos subidos, con sus números (cuesta ~2 unidades de las 10.000 diarias).
export async function videos(lista, max = 50) {
  // Un canal sin videos todavía no tiene lista de subidas: eso es «0 videos», no un error.
  const pl = await get('/playlistItems', { part: 'contentDetails', playlistId: lista, maxResults: String(max) })
    .catch((e) => { if (/cannot be found|playlistNotFound/i.test(e.message)) return { items: [] }; throw e; });
  const ids = (pl.items || []).map((i) => i.contentDetails.videoId);
  if (!ids.length) return [];
  const v = await get('/videos', { part: 'statistics,snippet,contentDetails', id: ids.join(',') });
  return (v.items || []).map((x) => ({
    id: x.id, titulo: x.snippet.title, publicado: x.snippet.publishedAt,
    duracion: segundos(x.contentDetails.duration), permalink: `https://youtube.com/shorts/${x.id}`,
    vistas: Number(x.statistics.viewCount ?? 0), me_gusta: x.statistics.likeCount == null ? null : Number(x.statistics.likeCount), comentarios: Number(x.statistics.commentCount ?? 0),
  }));
}

function segundos(iso) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '') || [];
  return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Number(m[3] || 0);
}

// ── Conexión OAuth (solo el permiso de subir: Google pide no pedir de más) ──
export function urlAutorizar(redirect, state) {
  const p = new URLSearchParams({
    client_id: process.env.YT_CLIENT_ID?.trim(),
    redirect_uri: redirect,
    response_type: 'code',
    scope: PERMISO_YT,
    access_type: 'offline', // para recibir la llave larga (refresh_token)
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `${OAUTH}?${p}`;
}

async function token(params) {
  const r = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.YT_CLIENT_ID?.trim(), client_secret: process.env.YT_CLIENT_SECRET?.trim(), ...params }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`Google: ${j.error_description || j.error || r.status}`);
  return j;
}

function guardar(j) {
  const t = { access_token: j.access_token, expira: new Date(Date.now() + (j.expires_in || 3600) * 1000).toISOString() };
  if (j.refresh_token) t.refresh_token = j.refresh_token; // Google no la manda al renovar: se conserva la que hay
  return t;
}

export async function canjearCodigo(code, redirect) {
  const j = await token({ code, grant_type: 'authorization_code', redirect_uri: redirect });
  if (!String(j.scope || '').includes('youtube.upload')) throw new Error('Falta marcar el permiso «Administrar tus videos de YouTube» al conectar. Prueba otra vez y deja la casilla marcada.');
  if (!j.refresh_token) throw new Error('Google no entregó la llave larga. Quita el acceso en myaccount.google.com/permissions y conecta otra vez.');
  let usuario = null;
  try { const c = await canal(); usuario = (c.usuario || c.titulo || '').replace(/^@/, ''); } catch {}
  return { ...guardar(j), cuenta_id: process.env.YT_CANAL || null, usuario };
}

export async function refrescar(refresh) {
  return guardar(await token({ grant_type: 'refresh_token', refresh_token: refresh }));
}

// Lo pide la política de YouTube: desconectar desde el panel revoca la llave en Google al momento.
export async function revocar(t) {
  if (!t) return;
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(t)}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).catch(() => {});
}

// ── Subida reanudable (videos.insert) leyendo el video del almacén por trozos ──
// Cada trozo tiene que ser múltiplo de 256 KB (menos el último). 16 MB = 64 × 256 KB.
const TROZO = 16 * 1024 * 1024;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const limpio = (s) => String(s || '').replace(/[<>]/g, '').trim(); // YouTube rechaza < y >

export function metadatos({ texto, privacidad }) {
  const lineas = limpio(texto).split('\n');
  let titulo = lineas[0].slice(0, 100).trim() || 'es_enserio.tv';
  let descripcion = limpio(texto);
  while (Buffer.byteLength(descripcion, 'utf8') > 5000) descripcion = descripcion.slice(0, -50);
  return {
    snippet: { title: titulo, description: descripcion, categoryId: '24', defaultLanguage: 'es', defaultAudioLanguage: 'es-419' },
    status: {
      privacyStatus: PRIVACIDADES.includes(privacidad) ? privacidad : 'public',
      selfDeclaredMadeForKids: false, // no es para niños (CLAUDE.md)
      // Títeres de papel: no es contenido realista alterado. Si algún día se usa una voz o cara realista de alguien, va true.
      containsSyntheticMedia: false,
      embeddable: true,
    },
  };
}

async function errorDe(r) {
  const j = await r.json().catch(() => ({}));
  return j.error?.message || j.error?.errors?.[0]?.reason || `HTTP ${r.status}`;
}

async function cuantoLlego(sesion, bytes) {
  const r = await fetch(sesion, { method: 'PUT', headers: { 'Content-Length': '0', 'Content-Range': `bytes */${bytes}` } });
  if (r.status === 200 || r.status === 201) return { listo: await r.json() };
  if (r.status !== 308) throw new Error(`YouTube perdió la subida (${r.status})`);
  const rango = r.headers.get('range');
  return { desde: rango ? Number(rango.split('-')[1]) + 1 : 0 };
}

export async function subirVideo(t, { videoUrl, bytes, texto, privacidad }) {
  const ini = await fetch(`${SUBIDA}?uploadType=resumable&part=snippet,status`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${t}`, 'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': String(bytes), 'X-Upload-Content-Type': 'video/mp4',
    },
    body: JSON.stringify(metadatos({ texto, privacidad })),
  });
  if (!ini.ok) throw new Error(`YouTube no abrió la subida: ${await errorDe(ini)}`);
  const sesion = ini.headers.get('location');
  if (!sesion) throw new Error('YouTube no devolvió la dirección de subida');

  let desde = 0;
  for (let vueltas = 0; desde < bytes && vueltas < 200; vueltas++) {
    const hasta = Math.min(desde + TROZO, bytes) - 1;
    const pedazo = await fetch(videoUrl, { headers: { Range: `bytes=${desde}-${hasta}` } });
    if (pedazo.status !== 206 && !(pedazo.status === 200 && desde === 0 && hasta === bytes - 1)) throw new Error(`No pude leer el video (${pedazo.status})`);
    const cuerpo = Buffer.from(await pedazo.arrayBuffer());
    let r;
    for (let intento = 0; intento < 4; intento++) {
      r = await fetch(sesion, {
        method: 'PUT',
        headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(cuerpo.length), 'Content-Range': `bytes ${desde}-${hasta}/${bytes}` },
        body: cuerpo,
      }).catch(() => ({ status: 599 }));
      if (r.status < 500) break;
      await espera(1500 * 2 ** intento);
    }
    if (r.status === 200 || r.status === 201) return (await r.json()).id;
    if (r.status === 308) {
      const rango = r.headers.get('range');
      desde = rango ? Number(rango.split('-')[1]) + 1 : 0;
      continue;
    }
    if (r.status >= 500) { // no se sabe cuánto llegó: se pregunta y se sigue desde ahí
      const e = await cuantoLlego(sesion, bytes);
      if (e.listo) return e.listo.id;
      desde = e.desde;
      continue;
    }
    throw new Error(`YouTube rechazó el video: ${await errorDe(r)}`);
  }
  const e = await cuantoLlego(sesion, bytes);
  if (e.listo) return e.listo.id;
  throw new Error('YouTube no confirmó la subida');
}

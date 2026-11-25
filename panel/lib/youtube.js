// YouTube: los números públicos del canal con una llave de Google (YT_API_KEY) y el id del canal (YT_CANAL).
// No hace falta conectar la cuenta: solo se leen vistas, me gusta y comentarios, que son públicos.
const API = 'https://www.googleapis.com/youtube/v3';

async function get(ruta, q) {
  const u = new URL(API + ruta);
  for (const [k, v] of Object.entries({ ...q, key: process.env.YT_API_KEY })) u.searchParams.set(k, v);
  const r = await fetch(u, { cache: 'no-store' });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || `YouTube ${r.status}`);
  return j;
}

export const listo = () => Boolean(process.env.YT_API_KEY && process.env.YT_CANAL);

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

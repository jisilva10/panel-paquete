// Lo corre el disparador cuando una función está lista: revisa el MP4, lo sube al almacén y lo deja en la cola.
//   npm run programar -- --carpeta "../2 Funciones/001. La guerra de los emus" --hora "2026-11-28 11:30"
//   (o a mano: --video <mp4> --pieza "001. Título" --texto-archivo texto.txt --portada <jpg> --etiquetas <json>)
//   opciones: --portada portada.jpg  --etiquetas etiquetas.json  --texto "…"  --solo instagram|tiktok|youtube
//             --probar (revisa sin subir)  --cola (muestra la cola)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { put } from '@vercel/blob';
import { panel } from './panel.mjs';

// El token del almacén de videos sí se puede bajar (vercel env pull → .env.local).
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
  .map((l) => l.match(/^([A-Z0-9_]+)="?(.*?)"?$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => {
  if (x.startsWith('--')) a.push([x.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return a;
}, []));
// --carpeta "2 Funciones/NNN. Título": el nombre en el panel ES el nombre de la carpeta (nunca se escribe a mano),
// y de ahí salen el video (salida/video.mp4), la portada, las etiquetas y el texto.
if (args.carpeta) {
  const c = path.resolve(args.carpeta);
  args.pieza = path.basename(c);
  const si = (f) => (fs.existsSync(path.join(c, f)) ? path.join(c, f) : undefined);
  args.video ??= si('salida/video.mp4');
  args.portada ??= si('portada.jpg');
  args.etiquetas ??= si('etiquetas.json');
  args['texto-archivo'] ??= si('texto.txt');
}
const enEcuador = (iso) => new Intl.DateTimeFormat('es-EC', { timeZone: 'America/Guayaquil', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

if (args.cola) {
  const data = await panel('/api/publicaciones');
  for (const p of data.reverse()) console.log(`${enEcuador(p.programada_para).padEnd(32)} ${p.pieza.padEnd(44)} IG ${p.ig_estado} · TT ${p.tt_estado} · YT ${p.yt_estado}`);
  process.exit(0);
}

const fallas = [];
const video = args.video && path.resolve(args.video);
if (!video || !fs.existsSync(video)) fallas.push('No encuentro el video (--video)');
if (!args.pieza) fallas.push('Falta --pieza');
if (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(args.hora || '')) fallas.push('Falta --hora "AAAA-MM-DD HH:MM" (hora de Ecuador)');
const texto = args['texto-archivo'] ? fs.readFileSync(args['texto-archivo'], 'utf8').trim() : (args.texto || '');
if (fallas.length) { console.error('✗ ' + fallas.join('\n✗ ')); process.exit(1); }

// ── Revisión del MP4 (puede pesar bien y estar roto o en HDR) ──
const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', video]).toString());
const v = info.streams.find((s) => s.codec_type === 'video');
const a = info.streams.find((s) => s.codec_type === 'audio');
const duracion = Number(info.format.duration);
const bytes = fs.statSync(video).size;
const avisos = [];
if (!v) fallas.push('El archivo no tiene video');
else {
  if (!['h264', 'hevc'].includes(v.codec_name)) fallas.push(`Códec ${v.codec_name}: Instagram pide H.264 o HEVC`);
  if (['smpte2084', 'arib-std-b67'].includes(v.color_transfer)) fallas.push('Está en HDR: hay que pasarlo a SDR antes');
  if (v.width > v.height === true) avisos.push(`Es horizontal (${v.width}×${v.height})`);
  const fps = eval(v.avg_frame_rate);
  if (fps < 23 || fps > 60) fallas.push(`${fps.toFixed(1)} fps: TikTok pide entre 23 y 60`);
}
if (!a) avisos.push('No tiene audio');
if (duracion < 3 || duracion > 900) fallas.push(`Dura ${duracion.toFixed(1)} s: Instagram pide entre 3 s y 15 min`);
if (bytes > 300 * 1048576) fallas.push(`Pesa ${(bytes / 1048576).toFixed(0)} MB: Instagram acepta hasta 300 MB`);

const cuando = new Date(`${args.hora.replace(' ', 'T')}:00-05:00`);
const h = Number(args.hora.slice(11, 13));
if (h < 7) avisos.push(`Sale a las ${args.hora.slice(11)} DE LA MADRUGADA`);
if (cuando < new Date()) avisos.push('Esa hora ya pasó: sale en los próximos 5 minutos');
if (!texto) avisos.push('Va sin texto');
const redes = args.solo ? String(args.solo).split(',') : ['instagram', 'tiktok', 'youtube'];
const etiquetas = args.etiquetas ? JSON.parse(fs.readFileSync(args.etiquetas, 'utf8')) : {};
const portada = args.portada && path.resolve(args.portada);
if (portada && !fs.existsSync(portada)) fallas.push('No encuentro la portada (--portada)');

console.log(`Pieza   ${args.pieza}\nSale    ${enEcuador(cuando)} (Ecuador)\nRedes   ${redes.join(' + ')}\nVideo   ${path.basename(video)} · ${(bytes / 1048576).toFixed(0)} MB · ${duracion.toFixed(1)} s · ${v?.width}×${v?.height} ${v?.codec_name}\nTexto   ${texto ? texto.split('\n')[0].slice(0, 70) + (texto.length > 70 ? '…' : '') : '—'}`);
for (const x of avisos) console.log(`⚠ ${x}`);
if (fallas.length) { console.error('✗ ' + fallas.join('\n✗ ')); process.exit(1); }
if (args.probar) { console.log('✓ Revisado. No se subió nada (--probar).'); process.exit(0); }

// La misma hora no se repite entre piezas.
const otras = (await panel('/api/publicaciones')).filter((o) => ['programada', 'en_curso'].includes(o.estado));
for (const o of otras) {
  if (o.pieza === args.pieza) { console.error(`✗ «${o.pieza}» ya está en la cola`); process.exit(1); }
  if (new Date(o.programada_para).toISOString().slice(11, 16) === cuando.toISOString().slice(11, 16)) console.log(`⚠ «${o.pieza}» también sale a esa hora otro día`);
}

const nombre = path.basename(video).normalize('NFD').replace(/[^\w.\-]+/g, '-');
process.stdout.write('Subiendo… ');
const blob = await put(`videos/${nombre}`, fs.createReadStream(video), {
  access: 'public', multipart: true, addRandomSuffix: true, contentType: 'video/mp4', token: env.BLOB_READ_WRITE_TOKEN,
});
let portadaUrl = null;
if (portada) {
  const p = await put(`portadas/${path.basename(portada).normalize('NFD').replace(/[^\w.\-]+/g, '-')}`, fs.createReadStream(portada), { access: 'public', addRandomSuffix: true, contentType: 'image/jpeg', token: env.BLOB_READ_WRITE_TOKEN });
  portadaUrl = p.url;
}
console.log('listo');
let data;
try {
  data = await panel('/api/publicaciones', { method: 'POST', body: {
    pieza: args.pieza, texto, programada_para: cuando.toISOString(), redes, video_url: blob.url, video_bytes: bytes,
    duracion: Math.round(duracion * 100) / 100, portada_url: portadaUrl, etiquetas,
  } });
} catch (e) { console.error('✗ ' + e.message); process.exit(1); }
console.log(`✓ En la cola: «${data.pieza}» sale el ${enEcuador(data.programada_para)}.`);

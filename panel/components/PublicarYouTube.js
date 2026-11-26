'use client';
import { useEffect, useState } from 'react';

// El almacén sirve el video «para ver» (inline): con un enlace normal el teléfono abre el reproductor y no lo guarda.
// Por eso: en el teléfono se abre el menú de compartir con el archivo («Guardar video» → Fotos, de donde lo toma YouTube);
// si eso no se puede, se baja como archivo con ?download=1 (el almacén lo manda como «attachment»).
const paraBajar = (url) => (url ? `${url}${url.includes('?') ? '&' : '?'}download=1` : url);

export function useArchivo(url, nombre) {
  const [archivo, setArchivo] = useState(null);
  useEffect(() => {
    if (!url || typeof navigator === 'undefined' || !navigator.canShare) return;
    let vivo = true;
    fetch(url).then((r) => (r.ok ? r.blob() : null)).then((b) => {
      if (!vivo || !b) return;
      const f = new File([b], nombre, { type: b.type || 'video/mp4' });
      if (navigator.canShare({ files: [f] })) setArchivo(f);
    }).catch(() => {});
    return () => { vivo = false; };
  }, [url, nombre]);
  return archivo;
}

export async function guardar(archivo, url) {
  if (archivo) {
    try { await navigator.share({ files: [archivo] }); return; } catch (e) { if (e?.name === 'AbortError') return; }
  }
  window.location.href = paraBajar(url);
}

// YouTube no deja publicar en público desde una herramienta propia sin auditoría:
// a la hora, esta tarjeta te da el video, la portada y el texto, y abre YouTube.
export default function PublicarYouTube({ p, api = '/api' }) {
  const [copiado, setCopiado] = useState(false);
  const [hecho, setHecho] = useState(false);
  const titulo = (p.texto || '').split('\n')[0].slice(0, 95);
  const base = (p.pieza || 'video').replace(/[^\p{L}\p{N} ._-]/gu, '').trim() || 'video';
  const video = useArchivo(p.video_url, `${base}.mp4`);
  const portada = useArchivo(p.portada_url, `${base} - portada.jpg`);

  async function copiar(t) { try { await navigator.clipboard.writeText(t); setCopiado(true); } catch { setCopiado(false); } }
  async function yaLoSubi() {
    const r = await fetch(`${api}/publicaciones`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, accion: 'yt_publicado' }) });
    if (r.ok) setHecho(true);
  }
  if (hecho) return <div className="alerta bien">Listo: «{p.pieza}» quedó en YouTube.</div>;

  return (
    <div className="carta publicar">
      <span className="chip aviso"><i className="punto yt" />Te toca en YouTube</span>
      <h2 style={{ margin: '12px 0 4px', fontSize: 18 }}>{p.pieza}</h2>
      <ol className="pasos">
        <li>Toca <b>Bajar el video</b> y elige <b>Guardar video</b> (queda en Fotos).</li>
        <li>Toca <b>Copiar y abrir YouTube</b>, luego <b>+</b> → <b>Short</b> y elige el video.</li>
        <li>Pega el texto como título y toca <b>Subir Short</b>.</li>
      </ol>
      <div className="texto-listo" onClick={() => copiar(titulo)}>{titulo || <span className="nota">(sin texto)</span>}</div>
      <div className="fila" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
        {p.video_url && <button className="boton grande claro" onClick={() => guardar(video, p.video_url)}>Bajar el video</button>}
        <button className="boton grande" onClick={async () => { await copiar(titulo); setTimeout(() => { window.location.href = 'youtube://'; }, 150); }}>{copiado ? 'Copiado · abriendo YouTube…' : 'Copiar y abrir YouTube'}</button>
      </div>
      <div className="fila" style={{ marginTop: 12, justifyContent: 'space-between' }}>
        {p.portada_url ? <button className="enlace" onClick={() => guardar(portada, p.portada_url)}>Bajar la portada</button> : <span />}
        <button className="enlace" onClick={yaLoSubi}>Ya lo subí</button>
      </div>
    </div>
  );
}

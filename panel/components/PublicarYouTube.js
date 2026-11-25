'use client';
import { useState } from 'react';

// YouTube no deja publicar en público desde una herramienta propia sin auditoría:
// a la hora, esta tarjeta te da el video, la portada y el texto, y abre YouTube.
export default function PublicarYouTube({ p, api = '/api' }) {
  const [copiado, setCopiado] = useState(false);
  const [hecho, setHecho] = useState(false);
  const titulo = (p.texto || '').split('\n')[0].slice(0, 95);

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
        <li>Toca <b>Bajar el video</b> (se guarda en tu teléfono).</li>
        <li>Toca <b>Copiar y abrir YouTube</b>, luego <b>+</b> → <b>Short</b> y elige el video.</li>
        <li>Pega el texto como título y toca <b>Subir Short</b>.</li>
      </ol>
      <div className="texto-listo" onClick={() => copiar(titulo)}>{titulo || <span className="nota">(sin texto)</span>}</div>
      <div className="fila" style={{ marginTop: 12, gap: 8, flexWrap: 'wrap' }}>
        {p.video_url && <a className="boton grande claro" href={p.video_url} download target="_blank" rel="noreferrer">Bajar el video</a>}
        <button className="boton grande" onClick={async () => { await copiar(titulo); setTimeout(() => { window.location.href = 'youtube://'; }, 150); }}>{copiado ? 'Copiado · abriendo YouTube…' : 'Copiar y abrir YouTube'}</button>
      </div>
      <div className="fila" style={{ marginTop: 12, justifyContent: 'space-between' }}>
        {p.portada_url ? <a className="enlace" href={p.portada_url} download target="_blank" rel="noreferrer">Bajar la portada</a> : <span />}
        <button className="enlace" onClick={yaLoSubi}>Ya lo subí</button>
      </div>
    </div>
  );
}

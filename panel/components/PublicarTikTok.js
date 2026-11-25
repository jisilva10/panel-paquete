'use client';
import { useState } from 'react';

// TikTok deja el video en tus borradores con una notificación.
// Esta tarjeta te da el texto listo para pegar y abre la app.
export default function PublicarTikTok({ p, compacta = false, api = '/api' }) {
  const [copiado, setCopiado] = useState(false);
  const [hecho, setHecho] = useState(false);
  const [abierta, setAbierta] = useState(!compacta);

  async function copiar() {
    try { await navigator.clipboard.writeText(p.texto || ''); setCopiado(true); } catch { setCopiado(false); }
  }

  async function copiarYAbrir() {
    await copiar();
    // En el teléfono abre la app de TikTok; en la compu no hace nada.
    setTimeout(() => { window.location.href = 'snssdk1233://'; }, 150);
  }

  async function yaLoPublique() {
    const r = await fetch(`${api}/publicaciones`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, accion: 'tt_publicado' }) });
    if (r.ok) setHecho(true);
  }

  if (hecho) return <div className="alerta bien">Listo: «{p.pieza}» quedó publicado en TikTok.</div>;
  if (!abierta) return <button className="boton chico" onClick={() => setAbierta(true)}>Publicar en TikTok</button>;

  return (
    <div className="carta publicar">
      <div className="fila" style={{ justifyContent: 'space-between' }}>
        <span className="chip aviso"><i className="punto tt" />En tus borradores de TikTok</span>
      </div>
      <h2 style={{ margin: '12px 0 4px', fontSize: 18 }}>{p.pieza}</h2>
      <ol className="pasos">
        <li>Toca <b>Copiar y abrir TikTok</b>.</li>
        <li>En TikTok toca la notificación «tu video está listo».</li>
        <li>Pega el texto en la descripción y toca <b>Publicar</b>.</li>
      </ol>
      <div className="texto-listo" onClick={copiar}>{p.texto || <span className="nota">(sin texto)</span>}</div>
      <div className="fila" style={{ marginTop: 12 }}>
        <button className="boton grande" onClick={copiarYAbrir}>{copiado ? 'Copiado · abriendo TikTok…' : 'Copiar y abrir TikTok'}</button>
      </div>
      <div className="fila" style={{ marginTop: 12, justifyContent: 'space-between' }}>
        <button className="enlace" onClick={copiar}>{copiado ? 'Texto copiado ✓' : 'Solo copiar el texto'}</button>
        <button className="enlace" onClick={yaLoPublique}>Ya lo publiqué</button>
      </div>
    </div>
  );
}

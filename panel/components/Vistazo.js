'use client';

// Vistazo: ver un video de la cola ANTES de que salga, solo si JIS quiere. No aprueba ni frena nada:
// si no lo mira, sale igual a su hora. Solo existe mientras la pieza está «programada»; cuando empieza
// a salir deja de mostrarse (y el almacén borra el video cuando ya salió en todas las redes, como siempre).
const ZONA = 'America/Guayaquil';
const hora = (iso) => new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

export const porSalir = (cola) => (cola || [])
  .filter((p) => p.estado === 'programada' && p.video_url)
  .sort((a, b) => new Date(a.programada_para) - new Date(b.programada_para));

export default function Vistazo({ p }) {
  return (
    <div className="vistazo">
      <span className="chip"><i className="punto" style={{ background: 'var(--acento, #ffd23f)' }} />Vistazo · todavía no sale</span>
      <h2 style={{ margin: '12px 0 2px', fontSize: 18 }}>{p.pieza}</h2>
      <div className="nota" style={{ marginBottom: 12 }}>Sale el <b style={{ color: 'var(--tinta)' }}>{hora(p.programada_para)}</b></div>
      <video className="vistazo-video" src={p.video_url} poster={p.portada_url || undefined} controls playsInline preload="metadata" />
      {p.texto && <div className="texto-listo" style={{ marginTop: 12, whiteSpace: 'pre-wrap', cursor: 'default' }}>{p.texto}</div>}
      {p.portada_url && <div className="fila" style={{ marginTop: 10 }}><a className="enlace" href={p.portada_url} target="_blank" rel="noreferrer">Ver la portada</a></div>}
    </div>
  );
}

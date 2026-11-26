'use client';
import { useMemo, useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { Estados } from './Estado';
import PublicarTikTok from './PublicarTikTok';
import Vistazo from './Vistazo';

const ZONA = 'America/Guayaquil';
const franja = (h) => (h < 6 ? 'de la madrugada' : h < 12 ? 'de la mañana' : h < 19 ? 'de la tarde' : 'de la noche');
function enPalabras(valor) {
  if (!valor) return '';
  const d = new Date(`${valor}:00-05:00`);
  const dia = new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const h = Number(valor.slice(11, 13));
  return `${dia}, ${valor.slice(11, 16)} ${franja(h)}`;
}
const cuando = (iso) => new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));
const MB = (b) => `${(b / 1048576).toFixed(0)} MB`;

function nombreDe(archivo) {
  return archivo.name.replace(/\.(mp4|mov)$/i, '').replace(/\s*-\s*(final|v\d+)$/i, '').trim();
}

export default function Programar({ cola, cuentas, ttDirecto = false, ytSolo = false }) {
  const [archivo, setArchivo] = useState(null);
  const [duracion, setDuracion] = useState(null);
  const [pieza, setPieza] = useState('');
  const [texto, setTexto] = useState('');
  const [hora, setHora] = useState('');
  const [redes, setRedes] = useState({ instagram: true, tiktok: true, youtube: true });
  const [encima, setEncima] = useState(false);
  const [progreso, setProgreso] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [lista, setLista] = useState(cola);
  const [viendo, setViendo] = useState(null);
  const entrada = useRef();

  const hNum = hora ? Number(hora.slice(11, 13)) : null;
  const pasado = hora && new Date(`${hora}:00-05:00`) < new Date();
  const ocupadas = useMemo(() => new Set(lista.filter((p) => p.estado !== 'cancelada').map((p) => cuando(p.programada_para).slice(-5))), [lista]);

  function elegir(f) {
    if (!f) return;
    if (!/video\/(mp4|quicktime)/.test(f.type)) { setMensaje({ t: 'mal', m: 'Tiene que ser un MP4.' }); return; }
    setArchivo(f); setPieza(nombreDe(f)); setMensaje(null);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => { setDuracion(Math.round(v.duration * 100) / 100); URL.revokeObjectURL(v.src); };
    v.src = URL.createObjectURL(f);
  }

  async function enviar() {
    const elegidas = Object.keys(redes).filter((r) => redes[r]);
    if (!archivo || !hora || !pieza || !elegidas.length) return;
    try {
      setProgreso(0); setMensaje(null);
      const limpio = archivo.name.normalize('NFD').replace(/[^\w.\-]+/g, '-');
      const blob = await upload(`videos/${limpio}`, archivo, {
        access: 'public', handleUploadUrl: '/api/subida', multipart: true, contentType: archivo.type,
        onUploadProgress: (e) => setProgreso(e.percentage),
      });
      const r = await fetch('/api/publicaciones', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieza, texto, programada_para: new Date(`${hora}:00-05:00`).toISOString(), redes: elegidas, video_url: blob.url, video_bytes: archivo.size, duracion }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setLista([j, ...lista]);
      setArchivo(null); setPieza(''); setTexto(''); setHora(''); setDuracion(null); setProgreso(null);
      setMensaje({ t: 'bien', m: `Listo: «${j.pieza}» sale el ${enPalabras(hora)}.` });
    } catch (e) {
      setProgreso(null); setMensaje({ t: 'mal', m: e.message });
    }
  }

  async function accion(id, a, extra = {}) {
    const r = await fetch('/api/publicaciones', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, accion: a, ...extra }) });
    const j = await r.json();
    if (!r.ok) { alert(j.error); return; }
    setLista(lista.map((p) => (p.id === id ? j : p)));
  }

  const ttUsuario = cuentas.tiktok?.usuario;
  return (
    <>
      <section className="rejilla dos">
        <div className="carta">
          {!archivo ? (
            <div className={`soltar ${encima ? 'encima' : ''}`} onClick={() => entrada.current.click()}
              onDragOver={(e) => { e.preventDefault(); setEncima(true); }} onDragLeave={() => setEncima(false)}
              onDrop={(e) => { e.preventDefault(); setEncima(false); elegir(e.dataTransfer.files[0]); }}>
              <div style={{ fontSize: 17, color: 'var(--tinta)', fontWeight: 550 }}>Toca o suelta aquí el MP4</div>
              <div className="nota" style={{ marginTop: 6 }}>el de «3 Video terminado»</div>
            </div>
          ) : (
            <div className="fila" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="nota">{archivo.name} · {MB(archivo.size)}{duracion ? ` · ${duracion.toFixed(1)} s` : ''}</span>
              <button className="boton claro chico" onClick={() => setArchivo(null)}>Cambiar</button>
            </div>
          )}
          <input ref={entrada} type="file" accept="video/mp4,video/quicktime" hidden onChange={(e) => elegir(e.target.files[0])} />
          <div className="espacio" />
          <label className="campo"><span>Pieza</span><input value={pieza} onChange={(e) => setPieza(e.target.value)} placeholder="56. NVIDIA nació en un Denny's" /></label>
          <label className="campo"><span>Texto de la publicación (el mismo va a las tres redes)</span><textarea value={texto} onChange={(e) => setTexto(e.target.value)} /></label>
          <label className="campo"><span>Día y hora · Ecuador</span><input type="datetime-local" value={hora} onChange={(e) => setHora(e.target.value)} /></label>
          {hora && <div className="nota" style={{ marginTop: -6, marginBottom: 12 }}>Sale el <b style={{ color: 'var(--tinta)' }}>{enPalabras(hora)}</b>.</div>}
          {hNum != null && hNum < 7 && <div className="alerta">Ojo: eso es {franja(hNum)}. ¿Seguro que no es {hNum + 12}:{hora.slice(14, 16)}?</div>}
          {pasado && <div className="alerta">Esa hora ya pasó: sale en los próximos 5 minutos.</div>}
          {hora && ocupadas.has(hora.slice(11, 16)) && <div className="alerta">Ya hay otra pieza a las {hora.slice(11, 16)}. Mejor variar la hora.</div>}
          <div className="fila" style={{ marginBottom: 16 }}>
            <label className="marcar"><input type="checkbox" checked={redes.instagram} onChange={(e) => setRedes({ ...redes, instagram: e.target.checked })} /><i className="punto ig" />Instagram{cuentas.instagram ? ` · @${cuentas.instagram.usuario}` : ' (sin conectar)'}</label>
            <label className="marcar"><input type="checkbox" checked={redes.tiktok} onChange={(e) => setRedes({ ...redes, tiktok: e.target.checked })} /><i className="punto tt" />TikTok{ttUsuario ? ` · @${ttUsuario}` : cuentas.tiktok ? '' : ' (sin conectar)'}</label>
            <label className="marcar"><input type="checkbox" checked={redes.youtube} onChange={(e) => setRedes({ ...redes, youtube: e.target.checked })} /><i className="punto yt" />YouTube{cuentas.youtube ? ` · @${cuentas.youtube.usuario}` : ''}</label>
          </div>
          {redes.tiktok && <p className="nota" style={{ marginTop: -4 }}>{ttDirecto ? <>En TikTok sale solo a esa hora si lo apruebas antes (toca «Ver» en la cola). Si no lo apruebas, llega a los borradores de {ttUsuario ? `@${ttUsuario}` : 'tu cuenta'}.</> : <>En TikTok el video llega a esa hora a los borradores de {ttUsuario ? `@${ttUsuario}` : 'tu cuenta'}. Te llega una notificación y en este panel aparece el botón «Publicar en TikTok» con el texto listo para pegar.</>}</p>}
          {redes.youtube && <p className="nota">{ytSolo ? 'En YouTube sale solo a esa hora (público; puedes cambiarlo en la cola).' : 'En YouTube, a esa hora aparece «Subir a YouTube» con el video y el texto listos: lo subes desde la app.'}</p>}
          {mensaje && <div className={`alerta ${mensaje.t}`}>{mensaje.m}</div>}
          <button className="boton" disabled={!archivo || !hora || !pieza || progreso != null} onClick={enviar}>{progreso != null ? `Subiendo… ${Math.round(progreso)} %` : 'Programar'}</button>
          {progreso != null && <div className="barraprog"><div style={{ width: `${progreso}%` }} /></div>}
        </div>
        <div className="carta">
          <h2>La cola</h2>
          {lista.length === 0 && <div className="vacio">Vacía.</div>}
          {lista.map((p) => (
            <div key={p.id} style={{ padding: '11px 0', borderTop: '1px solid var(--linea)', opacity: p.estado === 'cancelada' ? 0.45 : 1 }}>
              <div style={{ fontWeight: 550 }}>{p.pieza}</div>
              <div className="nota" style={{ margin: '3px 0 7px' }}>{cuando(p.programada_para)}</div>
              <Estados p={p} />
              {(p.ig_error || p.tt_error || p.yt_error) && <div className="nota" style={{ color: 'var(--mal)', marginTop: 6 }}>{p.ig_error || p.tt_error || p.yt_error}</div>}
              {ytSolo && p.estado === 'programada' && p.redes?.includes('youtube') && (
                <label className="nota fila" style={{ gap: 6, marginTop: 8 }}><i className="punto yt" />YouTube
                  <select style={{ width: 'auto', padding: '4px 8px' }} value={p.yt_privacidad || 'public'} onChange={(e) => accion(p.id, 'editar', { yt_privacidad: e.target.value })}>
                    <option value="public">Público</option><option value="unlisted">No listado</option><option value="private">Privado</option>
                  </select>
                </label>
              )}
              <div className="fila" style={{ marginTop: 8, gap: 6 }}>
                {p.estado === 'programada' && p.video_url && <button className="boton claro chico" onClick={() => setViendo(viendo === p.id ? null : p.id)}>{viendo === p.id ? 'Cerrar' : 'Ver'}</button>}
                {p.estado === 'programada' && <button className="boton claro chico" onClick={() => accion(p.id, 'ya')}>Sacar ya</button>}
                {p.estado === 'programada' && <button className="boton claro chico" onClick={() => confirm('¿Cancelar y borrar el video de la cola?') && accion(p.id, 'cancelar')}>Cancelar</button>}
                {p.estado === 'con_error' && <button className="boton claro chico" onClick={() => accion(p.id, 'reintentar')}>Reintentar</button>}
              </div>
              {viendo === p.id && p.estado === 'programada' && <div style={{ marginTop: 10 }}><Vistazo p={p} ttDirecto={ttDirecto} /></div>}
              {p.tt_estado === 'en_borradores' && <div style={{ marginTop: 10 }}><PublicarTikTok p={p} compacta /></div>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

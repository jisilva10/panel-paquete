'use client';
// El inicio de ¿En serio? (JIS, 26/11/2026: «minimalista, con jerarquía, mobile first, solo lo relevante;
// copiar el texto con solo tocar la caja, sin botones de más»). Arriba lo que te toca hacer, después lo que
// sale, después los números. Nada de etiquetas: lo que se probó vive en los textos de cada video.
import { useEffect, useMemo, useRef, useState } from 'react';
import { LogoIG, LogoTT, LogoYT } from '../Logos';
import { useArchivo, guardar } from '../PublicarYouTube';
import AprobarTikTok from '../AprobarTikTok';

const ZONA = 'America/Guayaquil';
const REDES = [['tiktok', LogoTT, 'TikTok'], ['instagram', LogoIG, 'Instagram'], ['youtube', LogoYT, 'YouTube']];
const entero = new Intl.NumberFormat('es-EC');
const decimal = new Intl.NumberFormat('es-EC', { maximumFractionDigits: 1 });
// 12.800 → «12,8 mil» · 1.250.000 → «1,3 M»
const num = (v) => (v == null ? '—' : v >= 1e6 ? `${decimal.format(v / 1e6)} M` : v >= 1e4 ? `${decimal.format(v / 1e3)} mil` : entero.format(v));
const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)} %`);
const titulo = (pieza = '') => pieza.replace(/^\d+\.\s*/, '');
const nro = (pieza = '') => (pieza.match(/^(\d+)\./) || [])[1];
const archivo = (pieza) => (pieza || 'video').replace(/[^\p{L}\p{N} ._-]/gu, '').trim() || 'video';
const fmt = (o) => (iso) => new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, ...o }).format(new Date(iso)).replace('.', '');
const hora = fmt({ hour: '2-digit', minute: '2-digit', hour12: false });
const diaCorto = fmt({ day: 'numeric', month: 'short' });
const diaSemana = fmt({ weekday: 'long' });
const diaLargo = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const clave = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });
function cuando(iso) {
  const hoy = clave(new Date().toISOString()), manana = clave(new Date(Date.now() + 864e5).toISOString()), d = clave(iso);
  return d === hoy ? 'Hoy' : d === manana ? 'Mañana' : diaSemana(iso).replace(/^./, (c) => c.toUpperCase());
}

// ── Copiar con solo tocar la caja ──
// Primero la copia «a la antigua», dentro del mismo toque (es la que funciona en todos los teléfonos);
// si no se puede, el portapapeles moderno.
function copiarYa(t) {
  const a = document.createElement('textarea');
  a.value = t; a.setAttribute('readonly', '');
  a.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
  document.body.appendChild(a); a.focus(); a.select(); a.setSelectionRange(0, t.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  a.remove();
  return ok;
}
async function copiar(t) {
  if (copiarYa(t)) return true;
  try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
}
function CajaCopiar({ texto }) {
  const [ok, setOk] = useState(false);
  const reloj = useRef();
  if (!texto) return <div className="ps-copiar vacia">Sin texto</div>;
  return (
    <button type="button" className={`ps-copiar ${ok ? 'ok' : ''}`} onClick={async () => {
      if (await copiar(texto)) { setOk(true); clearTimeout(reloj.current); reloj.current = setTimeout(() => setOk(false), 2200); }
    }}>
      <span className="ps-copiar-txt">{texto}</span>
      <span className="ps-copiar-pie" aria-live="polite">{ok ? '✓ Copiado' : 'Toca para copiar'}</span>
    </button>
  );
}

// ── Lo que te toca a ti: publicar en TikTok (YouTube e Instagram salen solos) ──
function TeToca({ p, api }) {
  const [hecho, setHecho] = useState(false);
  const portada = useArchivo(p.portada_url, `${archivo(p.pieza)} - portada.jpg`);
  if (hecho) return null;
  const listo = async () => {
    const r = await fetch(`${api}/publicaciones`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, accion: 'tt_publicado' }) });
    if (r.ok) setHecho(true);
  };
  return (
    <article className="ps-toca">
      <div className="ps-toca-cab">
        <LogoTT t={20} />
        <b>Publicar en TikTok</b>
        <span>· {titulo(p.pieza)}</span>
      </div>
      <div className="ps-toca-cuerpo">
        {p.portada_url && (
          <button type="button" className="ps-portada" onClick={() => guardar(portada, p.portada_url)} aria-label="Guardar la portada">
            <img src={p.portada_url} alt="" />
            <span className="ps-portada-pie">↓ Portada</span>
          </button>
        )}
        <CajaCopiar texto={p.texto || ''} />
      </div>
      <p className="ps-toca-pasos">
        Notificación de TikTok → borra <b>#panelenserio</b>, pega y pon la portada.{' '}
        <button type="button" className="ps-enlace" onClick={listo}>Listo</button>
      </p>
    </article>
  );
}

// ── Hoja que sube desde abajo (en la compu, ventana al centro) ──
function Hoja({ cerrar, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && cerrar();
    window.addEventListener('keydown', k);
    const antes = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = antes; };
  }, [cerrar]);
  return (
    <div className="ps-velo" onClick={cerrar}>
      <div className="ps-hoja" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="ps-asa" aria-hidden />
        <button type="button" className="ps-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
        {children}
      </div>
    </div>
  );
}

function VerVideo({ p, ttDirecto }) {
  return (
    <>
      <div className="ps-hoja-sup">{cuando(p.programada_para)} · {hora(p.programada_para)}</div>
      <h3 className="ps-hoja-tit">{titulo(p.pieza)}</h3>
      <video className="ps-video" src={p.video_url} poster={p.portada_url || undefined} controls playsInline preload="metadata" />
      <CajaCopiar texto={p.texto} />
      {ttDirecto && p.redes?.includes('tiktok') && p.tt_estado === 'pendiente' && <AprobarTikTok p={p} />}
    </>
  );
}

// ── Los números de un video ──
function Detalle({ p }) {
  const filas = [['Vistas', 'vistas'], ['Me gusta', 'me_gusta'], ['Comentarios', 'comentarios'], ['Compartidos', 'compartidos'], ['Guardados', 'guardados'], ['Alcance', 'alcance'], ['Seguidores ganados', 'seguidores']];
  const hay = (k) => REDES.some(([r]) => p[r]?.[k] != null);
  return (
    <>
      <div className="ps-hoja-sup">{nro(p.pieza) ? `#${nro(p.pieza)} · ` : ''}{p.fecha ? diaLargo(p.fecha) : ''}{p.duracion ? ` · ${Math.round(p.duracion)} s` : ''}</div>
      <h3 className="ps-hoja-tit">{titulo(p.pieza)}</h3>
      <div className="ps-dos">
        <div><span>Retención</span><b>{pct(p.retencion)}</b><small>en Instagram</small></div>
        <div><span>Guardados</span><b>{p.guardadosMil == null ? '—' : p.guardadosMil.toLocaleString('es-EC', { maximumFractionDigits: 1 })}</b><small>por cada mil vistas</small></div>
      </div>
      <table className="ps-tabla">
        <thead><tr><th />{REDES.map(([r, L]) => <th key={r}><L t={18} /></th>)}</tr></thead>
        <tbody>{filas.filter(([, k]) => hay(k)).map(([t, k]) => <tr key={k}><td>{t}</td>{REDES.map(([r]) => <td key={r}>{num(p[r]?.[k])}</td>)}</tr>)}</tbody>
      </table>
      <div className="ps-abrir">{REDES.map(([r, , n]) => p[r]?.permalink && <a key={r} href={p[r].permalink} target="_blank" rel="noreferrer">Abrir en {n} ↗</a>)}</div>
    </>
  );
}

// ── Últimos 7 días, por red (nunca se suman) ──
function Cambio({ v, por }) {
  if (v == null || !Number.isFinite(v) || v === 0) return <small className="ps-cambio">&nbsp;</small>;
  return <small className={`ps-cambio ${v > 0 ? 'sube' : 'baja'}`}>{v > 0 ? '▲' : '▼'} {por ? `${Math.abs(Math.round(v * 100))} %` : entero.format(Math.abs(v))}</small>;
}
function Semana({ redes }) {
  const filas = REDES.filter(([r]) => redes[r]);
  return (
    <div className="ps-carta ps-semana">
      <div className="ps-semana-fila ps-semana-cab"><span /><span>Seguidores</span><span>Vistas</span><span>Me gusta</span></div>
      {filas.map(([r, L]) => {
        const d = redes[r];
        const seg = d.seguidores?.hoy != null && d.seguidores?.antes != null ? d.seguidores.hoy - d.seguidores.antes : null;
        return (
          <div key={r} className="ps-semana-fila">
            <L t={28} />
            <span><b>{num(d.seguidores?.hoy)}</b><Cambio v={seg} /></span>
            <span><b>{num(d.semana)}</b><Cambio v={d.semanaAntes ? (d.semana - d.semanaAntes) / d.semanaAntes : null} por /></span>
            <span><b>{num(d.likes)}</b><Cambio v={d.likesAntes ? (d.likes - d.likesAntes) / d.likesAntes : null} por /></span>
          </div>
        );
      })}
    </div>
  );
}

// ── Vistas por semana (solo si ya hay 2 semanas para comparar) ──
function lunes(iso) {
  const d = new Date(new Date(iso).getTime() - 5 * 3600e3);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7))).toISOString().slice(0, 10);
}
function Curva({ piezas }) {
  const ref = useRef(null);
  const [w, setW] = useState(340);
  useEffect(() => {
    if (!ref.current) return;
    const o = new ResizeObserver(([e]) => setW(Math.max(240, e.contentRect.width)));
    o.observe(ref.current); return () => o.disconnect();
  }, []);
  const semanas = useMemo(() => {
    const m = new Map();
    for (const p of piezas) for (const [r] of REDES) {
      const v = p[r]?.vistas; if (v == null) continue;
      const k = lunes(p[r].fecha || p.fecha);
      if (!m.has(k)) m.set(k, { k, tiktok: 0, instagram: 0, youtube: 0 });
      m.get(k)[r] += Number(v);
    }
    return [...m.values()].sort((a, b) => a.k.localeCompare(b.k)).slice(-8);
  }, [piezas]);
  if (semanas.length < 2) return null;
  const H = 128, iz = 6, de = 6, ar = 10, ab = 22;
  const max = Math.max(...semanas.flatMap((s) => [s.tiktok, s.instagram, s.youtube]), 1);
  const x = (i) => iz + (i / (semanas.length - 1)) * (w - iz - de);
  const y = (v) => ar + (1 - v / max) * (H - ar - ab);
  return (
    <section className="ps-sec">
      <h2 className="ps-h">Vistas por semana</h2>
      <div className="ps-carta ps-curva" ref={ref}>
        <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label="Vistas por semana">
          <line x1={iz} x2={w - de} y1={y(max)} y2={y(max)} className="guia" />
          <line x1={iz} x2={w - de} y1={y(max / 2)} y2={y(max / 2)} className="guia" />
          {REDES.map(([r]) => semanas.some((s) => s[r] > 0) && <polyline key={r} className={`l-${r}`} points={semanas.map((s, i) => `${x(i)},${y(s[r])}`).join(' ')} />)}
          {semanas.map((s, i) => (w > 420 || semanas.length <= 4 || i % 2 === (semanas.length - 1) % 2) && <text key={s.k} x={x(i)} y={H - 5} textAnchor={i === 0 ? 'start' : i === semanas.length - 1 ? 'end' : 'middle'} className="eje">{diaCorto(`${s.k}T12:00:00Z`)}</text>)}
        </svg>
        <div className="ps-leyenda">{REDES.map(([r, L, n]) => <span key={r}><i className={`ps-punto ${r}`} />{n}</span>)}</div>
      </div>
    </section>
  );
}

// ── Los videos, uno contra otro ──
const METRICAS = [['vistas', 'Vistas'], ['me_gusta', 'Likes'], ['compartidos', 'Compartidos'], ['retencion', 'Retención']];
function valor(p, red, m) { return m === 'retencion' ? (red === 'instagram' ? p.retencion : null) : p[red]?.[m] ?? null; }
function Videos({ piezas, abrir }) {
  const [m, setM] = useState('vistas');
  const [orden, setOrden] = useState('recientes');
  const redes = m === 'retencion' ? REDES.filter(([r]) => r === 'instagram') : REDES;
  const { lista, mejor } = useMemo(() => {
    // «Mejores»: el lugar relativo en cada red (0-1), promediado. Las redes no se suman.
    const rango = {};
    for (const [r] of redes) {
      const vs = piezas.map((p) => valor(p, r, m)).filter((v) => v != null).sort((a, b) => a - b);
      rango[r] = (v) => (v == null || !vs.length ? null : vs.filter((x) => x <= v).length / vs.length);
    }
    const nota = (p) => { const xs = redes.map(([r]) => rango[r](valor(p, r, m))).filter((x) => x != null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : -1; };
    const lista = orden === 'mejores' ? [...piezas].sort((a, b) => nota(b) - nota(a)) : piezas;
    const mejor = Object.fromEntries(redes.map(([r]) => [r, Math.max(...piezas.map((p) => valor(p, r, m) ?? -1))]));
    return { lista, mejor };
  }, [piezas, m, orden, redes]);
  return (
    <section className="ps-sec">
      <div className="ps-h-fila">
        <h2 className="ps-h">Videos <span>{piezas.length}</span></h2>
        <div className="ps-seg" role="tablist" aria-label="Orden">
          {[['recientes', 'Recientes'], ['mejores', 'Mejores']].map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={orden === k} className={orden === k ? 'activo' : ''} onClick={() => setOrden(k)}>{t}</button>)}
        </div>
      </div>
      <div className="ps-chips" role="tablist" aria-label="Qué número ver">
        {METRICAS.map(([k, t]) => <button key={k} type="button" role="tab" aria-selected={m === k} className={m === k ? 'activo' : ''} onClick={() => setM(k)}>{t}</button>)}
      </div>
      <div className="ps-carta ps-lista">
        {piezas.length === 0 && <div className="ps-vacio">Cuando salgan los primeros videos, aquí se comparan.</div>}
        {piezas.length > 0 && (
          <div className={`ps-fila ps-fila-cab r${redes.length}`}>
            <span />
            {redes.map(([r, L]) => <span key={r} className="ps-col"><L t={16} /></span>)}
          </div>
        )}
        {lista.map((p) => (
          <button type="button" key={p.pieza + p.fecha} className={`ps-fila r${redes.length}`} onClick={() => abrir(p)}>
            <span className="ps-fila-tit"><b>{titulo(p.pieza)}</b><small>{nro(p.pieza) ? `#${nro(p.pieza)} · ` : ''}{p.fecha ? diaCorto(p.fecha) : ''}</small></span>
            {redes.map(([r]) => {
              const v = valor(p, r, m);
              return <span key={r} className={`ps-col ${v != null && v === mejor[r] && piezas.length > 1 ? 'top' : ''}`}>{m === 'retencion' ? pct(v) : num(v)}</span>;
            })}
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Todo junto ──
export default function Inicio({ r, ttDirecto = false, api = '/api' }) {
  const [hoja, setHoja] = useState(null); // { tipo: 'video' | 'pieza', p }
  const borradores = r.cola.filter((p) => p.tt_estado === 'en_borradores');
  const salen = r.cola.filter((p) => p.estado === 'programada' && p.video_url).sort((a, b) => new Date(a.programada_para) - new Date(b.programada_para));
  return (
    <div className="ps-rejilla">
      <div className="ps-col-a">
        {borradores.length > 0 && <section className="ps-sec">{borradores.map((p) => <TeToca key={p.id} p={p} api={api} />)}</section>}
        {salen.length > 0 && (
          <section className="ps-sec">
            <h2 className="ps-h">Por salir <span>{salen.length}</span></h2>
            <div className="ps-tira">
              {salen.map((p) => (
                <button type="button" key={p.id} className="ps-mini" onClick={() => setHoja({ tipo: 'video', p })} aria-label={titulo(p.pieza)}>
                  <span className="ps-mini-img">{p.portada_url ? <img src={p.portada_url} alt="" loading="lazy" /> : <span className="ps-sin" />}</span>
                  <span className="ps-mini-dia">{cuando(p.programada_para)}</span>
                  <span className="ps-mini-hora">{hora(p.programada_para)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="ps-sec">
          <h2 className="ps-h">Últimos 7 días</h2>
          <Semana redes={r.redes} />
        </section>
        <Curva piezas={r.piezas} />
      </div>
      <div className="ps-col-b">
        <Videos piezas={r.piezas} abrir={(p) => setHoja({ tipo: 'pieza', p })} />
      </div>
      {hoja && <Hoja cerrar={() => setHoja(null)}>{hoja.tipo === 'video' ? <VerVideo p={hoja.p} ttDirecto={ttDirecto} /> : <Detalle p={hoja.p} />}</Hoja>}
    </div>
  );
}

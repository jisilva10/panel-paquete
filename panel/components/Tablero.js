'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LogoIG, LogoTT, LogoYT, MarcaIG, MarcaTT, MarcaYT } from './Logos';
import PublicarTikTok from './PublicarTikTok';
import PublicarYouTube from './PublicarYouTube';
import Vistazo, { porSalir } from './Vistazo';

const ZONA = 'America/Guayaquil';
const n = (v) => (v == null ? '—' : Number(v).toLocaleString('es-EC'));
const pct = (v) => (v == null ? '—' : `${Math.round(v * 100)} %`);
const seg = (v) => (v == null ? '—' : `${Number(v).toLocaleString('es-EC', { maximumFractionDigits: 1 })} s`);
const dia = (iso) => (iso ? new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, day: 'numeric', month: 'short' }).format(new Date(iso)).replace('.', '') : '—');
const horaCorta = (iso) => new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)).replace('.', '');
const diaLargo = (iso) => (iso ? new Intl.DateTimeFormat('es-EC', { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)) : '—');

// ── Una tarjeta por red: seguidores y vistas de la semana juntos ──
function Red({ logo, nombre, d }) {
  const dSeg = d.seguidores.hoy != null && d.seguidores.antes != null ? d.seguidores.hoy - d.seguidores.antes : null;
  const dVis = d.semanaAntes ? (d.semana - d.semanaAntes) / d.semanaAntes : null;
  const dLik = d.likesAntes ? (d.likes - d.likesAntes) / d.likesAntes : null;
  const clase = (x) => (x > 0 ? 'sube' : x < 0 ? 'baja' : '');
  return (
    <div className={`carta red ${d.likes !== undefined ? 'tres' : ''}`}>
      <div className="red-logo">{logo}</div>
      <div className="red-datos">
        <div>
          <div className="red-num">{n(d.seguidores.hoy)}</div>
          <div className="red-pie">seguidores{dSeg != null && <b className={clase(dSeg)}> {dSeg > 0 ? '+' : ''}{dSeg}</b>}</div>
        </div>
        <div>
          <div className="red-num">{n(d.semana)}</div>
          <div className="red-pie">vistas · 7 días{dVis != null && <b className={clase(dVis)}> {dVis > 0 ? '+' : ''}{Math.round(dVis * 100)} %</b>}</div>
        </div>
        {d.likes !== undefined && (
          <div>
            <div className="red-num">{n(d.likes)}</div>
            <div className="red-pie">me gusta · 7 días{dLik != null && <b className={clase(dLik)}> {dLik > 0 ? '+' : ''}{Math.round(dLik * 100)} %</b>}</div>
          </div>
        )}
      </div>
      <span className="sr">{nombre}</span>
    </div>
  );
}

// ── El gráfico: vistas de lo publicado cada semana, una línea por red ──
function lunes(iso) {
  const d = new Date(new Date(iso).getTime() - 5 * 3600e3);
  const k = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - k)).toISOString().slice(0, 10);
}

// Mide su caja para dibujar a tamaño real (sin estirar letras ni logos).
function useTamano() {
  const ref = useRef(null);
  const [t, setT] = useState({ w: 400, h: 220 });
  useEffect(() => {
    if (!ref.current) return;
    const o = new ResizeObserver(([e]) => setT({ w: Math.max(240, e.contentRect.width), h: Math.max(140, e.contentRect.height) }));
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, t];
}

function Semanas({ piezas }) {
  const [caja, tam] = useTamano();
  const semanas = useMemo(() => {
    const m = new Map();
    for (const p of piezas) for (const red of ['instagram', 'tiktok', 'youtube']) {
      const v = p[red]?.vistas; if (v == null) continue;
      const k = lunes(p[red].fecha || p.fecha);
      if (!m.has(k)) m.set(k, { k, instagram: 0, tiktok: 0, youtube: 0 });
      m.get(k)[red] += Number(v);
    }
    return [...m.values()].sort((a, b) => a.k.localeCompare(b.k)).slice(-8);
  }, [piezas]);
  if (semanas.length < 2) return <div className="vacio">Aún no hay semanas para comparar.</div>;
  const W = tam.w, H = tam.h, iz = 8, de = 62, ar = 14, ab = 24;
  const max = Math.max(...semanas.flatMap((s) => [s.instagram, s.tiktok, s.youtube]), 1);
  const x = (i) => iz + (i / (semanas.length - 1)) * (W - iz - de);
  const y = (v) => ar + (1 - v / max) * (H - ar - ab);
  const linea = (red) => semanas.map((s, i) => `${x(i)},${y(s[red])}`).join(' ');
  const ult = semanas.at(-1);
  // Que las etiquetas del final no se pisen: se ordenan y se separan 22 px.
  const finales = [['instagram', y(ult.instagram)], ['tiktok', y(ult.tiktok)], ['youtube', y(ult.youtube)]].sort((a, b) => a[1] - b[1]);
  for (let i = 1; i < finales.length; i++) if (finales[i][1] - finales[i - 1][1] < 22) finales[i][1] = finales[i - 1][1] + 22;
  const fy = Object.fromEntries(finales); const yi = fy.instagram, yt = fy.tiktok, yy = fy.youtube;
  const conYT = semanas.some((s) => s.youtube > 0);
  return (
    <div ref={caja} className="g-medida">
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="grafico" role="img" aria-label="Vistas por semana">
      {[0.5, 1].map((t) => <line key={t} x1={iz} x2={W - de} y1={y(max * t)} y2={y(max * t)} className="guia" />)}
      <polyline points={linea('instagram')} className="l-ig" />
      <polyline points={linea('tiktok')} className="l-tt" />
      {conYT && <polyline points={linea('youtube')} className="l-yt" />}
      {semanas.map((s, i) => <g key={s.k}><circle cx={x(i)} cy={y(s.instagram)} r="2.6" className="p-ig" /><circle cx={x(i)} cy={y(s.tiktok)} r="2.6" className="p-tt" />{conYT && <circle cx={x(i)} cy={y(s.youtube)} r="2.6" className="p-yt" />}</g>)}
      <MarcaIG x={W - de + 16} y={yi} t={16} />
      <text x={W - de + 28} y={yi + 4} className="g-num">{n(ult.instagram)}</text>
      <MarcaTT x={W - de + 16} y={yt} t={16} />
      <text x={W - de + 28} y={yt + 4} className="g-num">{n(ult.tiktok)}</text>
      {conYT && <MarcaYT x={W - de + 16} y={yy} t={16} />}
      {conYT && <text x={W - de + 28} y={yy + 4} className="g-num">{n(ult.youtube)}</text>}
      {semanas.map((s, i) => (W > 520 || i % 2 === (semanas.length - 1) % 2) && <text key={s.k} x={x(i)} y={H - 6} textAnchor="middle" className="g-eje">{dia(`${s.k}T12:00:00Z`)}</text>)}
    </svg>
    </div>
  );
}

// ── La tabla: un solo cuadro con su propio scroll y orden por columna ──
const columnas = (que) => {
  const t = que === 'me_gusta' ? 'Me gusta' : 'Vistas';
  return [
    { k: 'numero', t: '#', v: (p) => p.numero },
    { k: 'ig', t: <><LogoIG t={15} /> <span className="th-txt">{t}</span></>, v: (p) => p.instagram?.[que] },
    { k: 'tt', t: <><LogoTT t={15} /> <span className="th-txt">{t}</span></>, v: (p) => p.tiktok?.[que] },
    { k: 'yt', t: <><LogoYT t={15} /> <span className="th-txt">{t}</span></>, v: (p) => p.youtube?.[que] },
    { k: 'retencion', t: <><LogoIG t={15} /> Retención</>, v: (p) => p.retencion },
  ];
};

function Tabla({ piezas, abrir }) {
  const [orden, setOrden] = useState({ k: 'numero', dir: 'natural' });
  const [que, setQue] = useState('vistas');
  const COLUMNAS = useMemo(() => columnas(que), [que]);
  const lista = useMemo(() => {
    if (orden.dir === 'natural') return piezas;
    const col = COLUMNAS.find((c) => c.k === orden.k);
    const s = orden.dir === 'desc' ? -1 : 1;
    return [...piezas].sort((a, b) => {
      const va = col.v(a), vb = col.v(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; if (vb == null) return -1;
      return (va - vb) * s;
    });
  }, [piezas, orden, COLUMNAS]);
  function tocar(k) {
    if (k === 'numero') return setOrden(orden.k === 'numero' && orden.dir === 'natural' ? { k, dir: 'asc' } : { k, dir: 'natural' });
    setOrden(orden.k === k && orden.dir === 'desc' ? { k, dir: 'asc' } : { k, dir: 'desc' });
  }
  const flecha = (k) => (orden.k !== k || orden.dir === 'natural' ? '' : orden.dir === 'desc' ? '↓' : '↑');
  return (
    <>
    <div className="que-ver" role="tablist" aria-label="Qué número ver">
      {[['vistas', 'Vistas'], ['me_gusta', 'Me gusta']].map(([k, t]) => (
        <button key={k} role="tab" aria-selected={que === k} className={que === k ? 'activo' : ''} onClick={() => setQue(k)}>{t}</button>
      ))}
    </div>
    <div className="tabla-caja">
      <table className="tabla-posts">
        <thead>
          <tr>
            {COLUMNAS.map((c, i) => (
              <th key={c.k} className={`${i === 0 ? 'col-num' : 'n'} ${orden.k === c.k && orden.dir !== 'natural' ? 'activa' : ''}`} onClick={() => tocar(c.k)} title="Ordenar">
                <span className="th-in">{c.t}<i className="flecha">{flecha(c.k)}</i></span>
              </th>
            )).flatMap((th, i) => (i === 0 ? [th, <th key="pieza" className="col-pieza">Publicación</th>] : [th]))}
          </tr>
        </thead>
        <tbody>
          {lista.map((p, i) => (
            <tr key={p.pieza + i} onClick={() => abrir(p)}>
              <td className="col-num">{p.numero ?? '·'}</td>
              <td className="col-pieza"><span className="pieza-nombre">{p.pieza.replace(/^\d+\.\s*/, '')}</span><span className="pieza-dia">{dia(p.fecha)}</span></td>
              <td className="n">{n(p.instagram?.[que])}</td>
              <td className="n">{n(p.tiktok?.[que])}</td>
              <td className="n">{n(p.youtube?.[que])}</td>
              <td className="n">{pct(p.retencion)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}

// ── La ventana con todo ──
function Detalle({ p, cerrar }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && cerrar();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [cerrar]);
  const filas = [
    ['Vistas', 'vistas', n], ['Alcance', 'alcance', n], ['Me gusta', 'me_gusta', n], ['Comentarios', 'comentarios', n],
    ['Guardados', 'guardados', n], ['Compartidos', 'compartidos', n], ['Seguidores ganados', 'seguidores', n], ['Tiempo promedio', 'tiempo', seg],
  ];
  const ig = p.instagram || {}, tt = p.tiktok || {}, yt = p.youtube || {};
  return (
    <div className="velo" onClick={cerrar}>
      <div className="ventana" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
        <div className="v-num">{p.numero ? `#${p.numero}` : ''} {p.formato ? `· ${p.formato}` : ''}</div>
        <h2 className="v-titulo">{p.pieza.replace(/^\d+\.\s*/, '')}</h2>
        <div className="v-sub">{diaLargo(p.fecha)}{p.duracion ? ` · ${seg(p.duracion)}` : ''}</div>
        {Object.keys(p.etiquetas || {}).length > 0 && <div className="etiquetas">{Object.entries(p.etiquetas).map(([k, v]) => <span key={k}>{k}: {String(v)}</span>)}</div>}
        <div className="v-destacados">
          <div><span>Retención</span><b>{pct(p.retencion)}</b></div>
          <div><span>Guardados por mil</span><b>{p.guardadosMil == null ? '—' : p.guardadosMil.toLocaleString('es-EC', { maximumFractionDigits: 1 })}</b></div>
        </div>
        <table className="v-tabla">
          <thead><tr><th /><th className="n"><LogoIG t={18} /></th><th className="n"><LogoTT t={18} /></th><th className="n"><LogoYT t={18} /></th></tr></thead>
          <tbody>
            {filas.map(([t, k, f]) => (ig[k] != null || tt[k] != null || yt[k] != null) && (
              <tr key={k}><td>{t}</td><td className="n">{f(ig[k])}</td><td className="n">{f(tt[k])}</td><td className="n">{f(yt[k])}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="v-enlaces">
          {ig.permalink && <a href={ig.permalink} target="_blank" rel="noreferrer" className="boton claro chico"><LogoIG t={14} /> Abrir en Instagram</a>}
          {tt.permalink && <a href={tt.permalink} target="_blank" rel="noreferrer" className="boton claro chico"><LogoTT t={14} /> Abrir en TikTok</a>}
          {yt.permalink && <a href={yt.permalink} target="_blank" rel="noreferrer" className="boton claro chico"><LogoYT t={14} /> Abrir en YouTube</a>}
        </div>
        {(ig.leido || tt.leido || yt.leido) && <div className="v-leido">Números leídos el {dia(`${ig.leido || tt.leido || yt.leido}T12:00:00Z`)}</div>}
      </div>
    </div>
  );
}

// ── Qué está ganando: promedio de vistas según lo que se probó (etiquetas de cada función) ──
function QueGana({ piezas }) {
  const grupos = useMemo(() => {
    const g = new Map();
    for (const p of piezas) for (const [k, v] of Object.entries(p.etiquetas || {})) {
      if (!g.has(k)) g.set(k, new Map());
      const m = g.get(k); const val = String(v);
      if (!m.has(val)) m.set(val, { val, n: 0, instagram: [], tiktok: [], youtube: [] });
      const f = m.get(val); f.n++;
      for (const red of ['instagram', 'tiktok', 'youtube']) if (p[red]?.vistas != null) f[red].push(Number(p[red].vistas));
    }
    const prom = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    return [...g.entries()].map(([k, m]) => ({ k, filas: [...m.values()].map((f) => ({ ...f, ig: prom(f.instagram), tt: prom(f.tiktok), yt: prom(f.youtube) })).sort((a, b) => (b.tt ?? -1) - (a.tt ?? -1)) }));
  }, [piezas]);
  if (!grupos.length) return <div className="vacio">Cuando salgan las primeras funciones, aquí se ve qué gana: tipo de historia, duración, gancho, cierre…</div>;
  return (
    <div className="gana">
      {grupos.map((g) => (
        <div key={g.k} className="gana-grupo">
          <div className="g-k">{g.k}</div>
          <div className="gana-fila"><span /><span><LogoTT t={13} /></span><span><LogoIG t={13} /></span><span><LogoYT t={13} /></span></div>
          {g.filas.map((f, i) => <div key={f.val} className={`gana-fila ${i === 0 ? 'top' : ''}`}><span>{f.val} <small className="nota">×{f.n}</small></span><span>{n(f.tt && Math.round(f.tt))}</span><span>{n(f.ig && Math.round(f.ig))}</span><span>{n(f.yt && Math.round(f.yt))}</span></div>)}
        </div>
      ))}
    </div>
  );
}

export default function Tablero({ r, api = '/api', gana = true, vistazo = false, ttDirecto = false }) {
  const [abierta, setAbierta] = useState(null);
  const [tarjeta, setTarjeta] = useState(null); // { red, p }
  const borradores = r.cola.filter((p) => p.tt_estado === 'en_borradores');
  const youtube = r.cola.filter((p) => p.yt_estado === 'para_ti');
  const enCola = vistazo ? porSalir(r.cola) : [];
  return (
    <>
      {enCola.length > 0 && (
        <div className="por-salir">
          <div className="g-titulo">Por salir · tócalo si quieres verlo antes</div>
          <div className="por-salir-lista">
            {enCola.map((p) => (
              <button key={p.id} className="por-salir-item" onClick={() => setTarjeta({ red: 'vistazo', p })}>
                {p.portada_url ? <img src={p.portada_url} alt="" loading="lazy" /> : <span className="sin-portada" />}
                <span className="por-salir-txt"><b>{p.pieza}</b><small>{horaCorta(p.programada_para)}</small>{ttDirecto && p.redes?.includes('tiktok') && p.tt_estado === 'pendiente' && <small className="falta-tt">{p.tt_aprobacion ? 'TikTok aprobado ✓' : 'TikTok: falta aprobar'}</small>}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {(borradores.length > 0 || youtube.length > 0) && (
        <div className="te-toca">
          {borradores.length > 0 && (
            <button className="aviso-tt" onClick={() => setTarjeta({ red: 'tiktok', p: borradores[0] })}>
              <LogoTT t={18} /> {borradores.length === 1 ? `«${borradores[0].pieza}» espera en tus borradores` : `${borradores.length} videos esperan en tus borradores`} · <b>Publicar</b>
            </button>
          )}
          {youtube.length > 0 && (
            <button className="aviso-yt" onClick={() => setTarjeta({ red: 'youtube', p: youtube[0] })}>
              <LogoYT t={18} /> {youtube.length === 1 ? `«${youtube[0].pieza}» toca subirlo a YouTube` : `${youtube.length} videos toca subirlos a YouTube`} · <b>Subir</b>
            </button>
          )}
        </div>
      )}
      <div className="tablero">
        <section className="izq">
          {r.redes.tiktok && <Red logo={<LogoTT t={40} />} nombre="TikTok" d={r.redes.tiktok} />}
          {r.redes.instagram && <Red logo={<LogoIG t={40} />} nombre="Instagram" d={r.redes.instagram} />}
          {r.redes.youtube && <Red logo={<LogoYT t={40} />} nombre="YouTube" d={r.redes.youtube} />}
          <div className="carta grafico-caja">
            <div className="g-titulo">Vistas por semana</div>
            <div className="g-area"><Semanas piezas={r.piezas} /></div>
          </div>
          {gana && (
            <div className="carta">
              <div className="g-titulo">Qué está ganando (vistas promedio)</div>
              <QueGana piezas={r.piezas} />
            </div>
          )}
        </section>
        <section className="carta der">
          <Tabla piezas={r.piezas} abrir={setAbierta} />
        </section>
      </div>
      {abierta && <Detalle p={abierta} cerrar={() => setAbierta(null)} />}
      {tarjeta && (
        <div className="velo" onClick={() => setTarjeta(null)}>
          <div className="ventana" onClick={(e) => e.stopPropagation()}>
            <button className="cerrar" onClick={() => setTarjeta(null)} aria-label="Cerrar">×</button>
            {tarjeta.red === 'vistazo' ? <Vistazo p={tarjeta.p} ttDirecto={ttDirecto} /> : tarjeta.red === 'tiktok' ? <PublicarTikTok p={tarjeta.p} api={api} /> : <PublicarYouTube p={tarjeta.p} api={api} />}
          </div>
        </div>
      )}
    </>
  );
}

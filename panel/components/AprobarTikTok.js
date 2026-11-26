'use client';
import { useEffect, useState } from 'react';

// Pantalla de aprobación para la publicación directa en TikTok (Direct Post), video por video.
// Sigue las Content Sharing Guidelines de TikTok: apodo del creador leído en el momento, privacidad sin valor
// por defecto, comentarios/dúo/stitch apagados de entrada (y bloqueados si la cuenta los tiene apagados),
// divulgación comercial apagada de entrada, aviso de música, vista previa (la pone Vistazo, arriba) y
// consentimiento explícito. Compatible con programar: lo aprobado se publica a su hora.
// Solo aparece con TT_DIRECTO=1. Sin aprobar, el video va a borradores como siempre.
const T = {
  es: {
    titulo: 'Publicar directo en TikTok', cuenta: 'Se publica en la cuenta', cargando: 'Preguntando a TikTok…',
    texto: 'Texto de la publicación', quien: '¿Quién puede ver este video?', elegir: 'Elige una opción…',
    permitir: 'Permitir que la gente', comentarios: 'Comente', duo: 'Haga dúo', stitch: 'Haga stitch',
    apagadoCuenta: 'apagado en tu configuración de TikTok',
    divulgar: 'Divulgar contenido comercial', divulgarNota: 'Actívalo si este video promociona una marca, un producto o un servicio.',
    tuMarca: 'Tu marca', tuMarcaNota: 'Te promocionas a ti o a tu propio negocio.',
    deMarca: 'Contenido de marca', deMarcaNota: 'Promocionas a otra marca o a un tercero.',
    falta: 'Tienes que indicar si tu contenido te promociona a ti, a un tercero o a ambos.',
    promo: 'Tu video se etiquetará como «Contenido promocional».', pagado: 'Tu video se etiquetará como «Colaboración pagada».',
    privadoNo: 'El contenido de marca no puede ser privado.',
    ia: 'Contenido generado con IA (TikTok le pone la etiqueta)',
    acepto1: 'Al publicar, aceptas la', musica: 'Confirmación de uso de música', y: 'y la', politicaMarca: 'Política de contenido de marca', deTikTok: 'de TikTok.',
    proceso: 'Después de publicarse, TikTok puede tardar unos minutos en procesar el video y mostrarlo en tu perfil.',
    largo: (d, m) => `El video dura ${d} s y esta cuenta permite hasta ${m} s.`,
    aprobar: (h) => `Aprobar: publicar en TikTok el ${h}`, aprobando: 'Guardando…',
    aprobado: 'Aprobado para TikTok', saldra: (h) => `Se publica solo el ${h}.`, quitar: 'Quitar la aprobación', cambiar: 'Cambiar',
    sinAprobar: 'Si no lo apruebas, llega a tus borradores como siempre.', reintentar: 'Volver a preguntar a TikTok',
  },
  en: {
    titulo: 'Post directly to TikTok', cuenta: 'Posting to account', cargando: 'Asking TikTok…',
    texto: 'Caption', quien: 'Who can view this video?', elegir: 'Select an option…',
    permitir: 'Allow users to', comentarios: 'Comment', duo: 'Duet', stitch: 'Stitch',
    apagadoCuenta: 'turned off in your TikTok settings',
    divulgar: 'Disclose video content', divulgarNota: 'Turn on to disclose that this video promotes goods or services in exchange for something of value.',
    tuMarca: 'Your brand', tuMarcaNota: 'You are promoting yourself or your own business.',
    deMarca: 'Branded content', deMarcaNota: 'You are promoting another brand or a third party.',
    falta: 'You need to indicate if your content promotes yourself, a third party, or both.',
    promo: "Your video will be labeled as 'Promotional content'.", pagado: "Your video will be labeled as 'Paid partnership'.",
    privadoNo: 'Branded content visibility cannot be set to private.',
    ia: 'AI-generated content (TikTok adds the label)',
    acepto1: "By posting, you agree to TikTok's", musica: 'Music Usage Confirmation', y: 'and', politicaMarca: 'Branded Content Policy', deTikTok: '',
    proceso: 'After posting, it may take a few minutes for TikTok to process the video and show it on your profile.',
    largo: (d, m) => `The video is ${d} s long and this account allows up to ${m} s.`,
    aprobar: (h) => `Approve: post to TikTok on ${h}`, aprobando: 'Saving…',
    aprobado: 'Approved for TikTok', saldra: (h) => `It will be posted automatically on ${h}.`, quitar: 'Remove approval', cambiar: 'Change',
    sinAprobar: 'If you do not approve it, it goes to your TikTok drafts as usual.', reintentar: 'Ask TikTok again',
  },
};
const PRIV = {
  es: { PUBLIC_TO_EVERYONE: 'Todo el mundo', MUTUAL_FOLLOW_FRIENDS: 'Amigos (se siguen mutuamente)', FOLLOWER_OF_CREATOR: 'Seguidores', SELF_ONLY: 'Solo yo' },
  en: { PUBLIC_TO_EVERYONE: 'Everyone', MUTUAL_FOLLOW_FRIENDS: 'Friends', FOLLOWER_OF_CREATOR: 'Followers', SELF_ONLY: 'Only me' },
};
const MUSICA = 'https://www.tiktok.com/legal/page/global/music-usage-confirmation/en';
const MARCA = 'https://www.tiktok.com/legal/page/global/bc-policy/en';
const hora = (iso, l) => new Intl.DateTimeFormat(l === 'en' ? 'en-US' : 'es-EC', { timeZone: 'America/Guayaquil', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso));

export default function AprobarTikTok({ p, api = '/api' }) {
  const [l, setL] = useState('es');
  const t = T[l];
  const [info, setInfo] = useState(null);
  const [falla, setFalla] = useState(null);
  const [aprobacion, setAprobacion] = useState(p.tt_aprobacion || null);
  const [editando, setEditando] = useState(!p.tt_aprobacion);
  const [titulo, setTitulo] = useState(p.tt_aprobacion?.title ?? p.texto ?? '');
  const [privacidad, setPrivacidad] = useState(''); // sin valor por defecto (regla de TikTok)
  const [com, setCom] = useState(false);
  const [duo, setDuo] = useState(false);
  const [stitch, setStitch] = useState(false);
  const [divulgar, setDivulgar] = useState(false);
  const [suMarca, setSuMarca] = useState(false);
  const [deMarca, setDeMarca] = useState(false);
  const [ia, setIa] = useState(true); // la voz es IA: se etiqueta (se puede quitar)
  const [guardando, setGuardando] = useState(false);

  async function preguntar() {
    setFalla(null); setInfo(null);
    try {
      const r = await fetch(`${api}/tiktok/creador`, { cache: 'no-store' });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'TikTok no respondió');
      setInfo(j);
    } catch (e) { setFalla(e.message); }
  }
  useEffect(() => { if (editando) preguntar(); }, [editando]);

  async function patch(cuerpo) {
    setGuardando(true); setFalla(null);
    try {
      const r = await fetch(`${api}/publicaciones`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, ...cuerpo }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setAprobacion(j.tt_aprobacion || null);
      setEditando(!j.tt_aprobacion);
    } catch (e) { setFalla(e.message); }
    setGuardando(false);
  }

  const idioma = (
    <span className="fila" style={{ gap: 4 }}>
      {['es', 'en'].map((x) => <button key={x} className={`boton chico ${l === x ? '' : 'claro'}`} style={{ padding: '2px 8px' }} onClick={() => setL(x)}>{x.toUpperCase()}</button>)}
    </span>
  );
  const cabeza = (
    <div className="fila" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
      <span className="chip aviso"><i className="punto tt" />{t.titulo}</span>{idioma}
    </div>
  );

  if (aprobacion && !editando) {
    return (
      <div className="carta aprobar-tt">
        {cabeza}
        <div className="alerta bien" style={{ margin: 0 }}><b>{t.aprobado}</b> · {PRIV[l][aprobacion.privacy_level] || aprobacion.privacy_level} · @{aprobacion.creador || '—'}<br />{t.saldra(hora(p.programada_para, l))}</div>
        <p className="nota" style={{ margin: '8px 0' }}>{[aprobacion.permitir_comentarios && t.comentarios, aprobacion.permitir_duo && t.duo, aprobacion.permitir_stitch && t.stitch].filter(Boolean).join(' · ') || '—'}{aprobacion.is_aigc ? ` · IA` : ''}</p>
        {falla && <div className="alerta mal">{falla}</div>}
        <div className="fila" style={{ gap: 8 }}>
          <button className="boton claro chico" onClick={() => setEditando(true)}>{t.cambiar}</button>
          <button className="boton claro chico" disabled={guardando} onClick={() => patch({ accion: 'tt_quitar_aprobacion' })}>{t.quitar}</button>
        </div>
      </div>
    );
  }

  const opciones = info?.privacy_level_options || [];
  const largo = info?.max_video_post_duration_sec && p.duracion && Number(p.duracion) > info.max_video_post_duration_sec;
  const faltaMarca = divulgar && !suMarca && !deMarca;
  const marcaPrivada = divulgar && deMarca && privacidad === 'SELF_ONLY';
  const listo = info && privacidad && !faltaMarca && !marcaPrivada && !largo && !guardando;
  const conMarca = divulgar && deMarca;

  return (
    <div className="carta aprobar-tt">
      {cabeza}
      {!info && !falla && <p className="nota">{t.cargando}</p>}
      {falla && <><div className="alerta mal">{falla}</div><button className="boton claro chico" onClick={preguntar}>{t.reintentar}</button></>}
      {info && (
        <>
          <div className="fila" style={{ gap: 10, marginBottom: 12 }}>
            {info.creator_avatar_url ? <img src={info.creator_avatar_url} alt="" width={36} height={36} style={{ borderRadius: '50%' }} /> : <span className="sin-portada" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--fondo)', display: 'inline-block' }} />}
            <span><span className="nota">{t.cuenta}</span><br /><b>{info.creator_nickname || info.creator_username}</b>{info.creator_username ? <span className="nota"> @{info.creator_username}</span> : null}</span>
          </div>
          {largo && <div className="alerta mal">{t.largo(Math.round(p.duracion), info.max_video_post_duration_sec)}</div>}
          <label className="campo"><span>{t.texto}</span><textarea value={titulo} maxLength={2200} onChange={(e) => setTitulo(e.target.value)} /></label>
          <label className="campo"><span>{t.quien}</span>
            <select value={privacidad} onChange={(e) => setPrivacidad(e.target.value)}>
              <option value="" disabled>{t.elegir}</option>
              {opciones.map((o) => <option key={o} value={o} disabled={o === 'SELF_ONLY' && conMarca} title={o === 'SELF_ONLY' && conMarca ? t.privadoNo : ''}>{PRIV[l][o] || o}</option>)}
            </select>
          </label>
          <div className="campo"><span>{t.permitir}</span>
            <div className="fila" style={{ gap: 14, flexWrap: 'wrap' }}>
              {[[t.comentarios, com, setCom, info.comment_disabled], [t.duo, duo, setDuo, info.duet_disabled], [t.stitch, stitch, setStitch, info.stitch_disabled]].map(([nombre, v, set, apagado]) => (
                <label key={nombre} className="marcar" style={{ opacity: apagado ? 0.45 : 1 }} title={apagado ? t.apagadoCuenta : ''}>
                  <input type="checkbox" checked={apagado ? false : v} disabled={apagado} onChange={(e) => set(e.target.checked)} />{nombre}{apagado ? <small className="nota"> ({t.apagadoCuenta})</small> : null}
                </label>
              ))}
            </div>
          </div>
          <div className="campo">
            <label className="marcar"><input type="checkbox" checked={divulgar} onChange={(e) => { setDivulgar(e.target.checked); if (!e.target.checked) { setSuMarca(false); setDeMarca(false); } }} /><b>{t.divulgar}</b></label>
            <div className="nota" style={{ marginTop: 4 }}>{t.divulgarNota}</div>
            {divulgar && (
              <div style={{ marginTop: 8, paddingLeft: 8, display: 'grid', gap: 6 }}>
                <label className="marcar"><input type="checkbox" checked={suMarca} onChange={(e) => setSuMarca(e.target.checked)} />{t.tuMarca} <small className="nota">· {t.tuMarcaNota}</small></label>
                <label className="marcar" title={privacidad === 'SELF_ONLY' ? t.privadoNo : ''} style={{ opacity: privacidad === 'SELF_ONLY' ? 0.45 : 1 }}>
                  <input type="checkbox" checked={deMarca} disabled={privacidad === 'SELF_ONLY'} onChange={(e) => setDeMarca(e.target.checked)} />{t.deMarca} <small className="nota">· {privacidad === 'SELF_ONLY' ? t.privadoNo : t.deMarcaNota}</small>
                </label>
                {faltaMarca && <div className="nota" style={{ color: 'var(--aviso)' }}>{t.falta}</div>}
                {deMarca ? <div className="nota">{t.pagado}</div> : suMarca ? <div className="nota">{t.promo}</div> : null}
              </div>
            )}
          </div>
          <label className="marcar" style={{ marginBottom: 12 }}><input type="checkbox" checked={ia} onChange={(e) => setIa(e.target.checked)} />{t.ia}</label>
          <p className="nota" style={{ margin: '4px 0 6px' }}>
            {t.acepto1} {conMarca && <><a className="enlace" href={MARCA} target="_blank" rel="noreferrer">{t.politicaMarca}</a> {t.y} </>}<a className="enlace" href={MUSICA} target="_blank" rel="noreferrer">{t.musica}</a> {t.deTikTok}
          </p>
          <p className="nota" style={{ margin: '0 0 12px' }}>{t.proceso}</p>
          <button className="boton" disabled={!listo} title={faltaMarca ? t.falta : ''} onClick={() => patch({ accion: 'tt_aprobar', aprobacion: {
            title: titulo, privacy_level: privacidad, permitir_comentarios: com, permitir_duo: duo, permitir_stitch: stitch,
            divulgar, brand_organic_toggle: suMarca, brand_content_toggle: deMarca, is_aigc: ia, consentimiento: true,
          } })}>{guardando ? t.aprobando : t.aprobar(hora(p.programada_para, l))}</button>
          <p className="nota" style={{ marginTop: 8 }}>{t.sinAprobar}</p>
        </>
      )}
    </div>
  );
}

const IG = { pendiente: ['Espera', ''], creando: ['Subiendo', 'aviso'], procesando: ['Instagram procesa', 'aviso'], publicado: ['Publicado', 'bien'], error: ['Error', 'mal'], no_va: null };
const TT = { pendiente: ['Espera', ''], subiendo: ['Subiendo', 'aviso'], en_tiktok: ['TikTok procesa', 'aviso'], en_borradores: ['En tus borradores: toca Publicar', 'aviso'], publicado: ['Publicado', 'bien'], error: ['Error', 'mal'], no_va: null };

export function Estados({ p }) {
  if (p.estado === 'cancelada') return <span className="chip">Cancelada</span>;
  const ig = IG[p.ig_estado], tt = TT[p.tt_estado];
  return (
    <span className="fila" style={{ gap: 6 }}>
      {ig && <span className={`chip ${ig[1]}`} title={p.ig_error || ''}><i className="punto ig" />{ig[0]}</span>}
      {tt && <span className={`chip ${tt[1]}`} title={p.tt_error || ''}><i className="punto tt" />{tt[0]}</span>}
    </span>
  );
}

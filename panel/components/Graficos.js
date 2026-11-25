// Gráficos en SVG, sin librerías: barras pareadas por pieza y la línea de seguidores.
const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString('es-EC'));

export function BarrasPorPieza({ piezas }) {
  const ps = piezas.filter((p) => p.instagram?.vistas != null || p.tiktok?.vistas != null).slice(0, 12).reverse();
  if (!ps.length) return <div className="vacio">Todavía no hay números.</div>;
  const max = Math.max(...ps.flatMap((p) => [p.instagram?.vistas || 0, p.tiktok?.vistas || 0]), 1);
  const W = 640, H = 200, pie = 34, ancho = W / ps.length, barra = Math.min(16, ancho / 3.2);
  const y = (v) => (H - pie) * (1 - v / max);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Vistas por pieza">
      {[0.5, 1].map((t) => <line key={t} x1="0" x2={W} y1={y(max * t)} y2={y(max * t)} stroke="var(--linea)" />)}
      <text x={W} y={y(max) - 4} textAnchor="end" fontSize="11" fill="var(--tenue)">{fmt(max)}</text>
      {ps.map((p, i) => {
        const cx = i * ancho + ancho / 2;
        const num = (p.pieza.match(/^(\d+)\./) || [])[1];
        return (
          <g key={i}>
            <title>{`${p.pieza}\nInstagram ${fmt(p.instagram?.vistas)} · TikTok ${fmt(p.tiktok?.vistas)}`}</title>
            {p.instagram?.vistas != null && <rect x={cx - barra - 1.5} y={y(p.instagram.vistas)} width={barra} height={H - pie - y(p.instagram.vistas)} rx="3" fill="var(--ig)" />}
            {p.tiktok?.vistas != null && <rect x={cx + 1.5} y={y(p.tiktok.vistas)} width={barra} height={H - pie - y(p.tiktok.vistas)} rx="3" fill="var(--tt)" />}
            <text x={cx} y={H - pie + 18} textAnchor="middle" fontSize="11.5" fill="var(--suave)">{num || '·'}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineaSeguidores({ ig, tt }) {
  const series = [['var(--ig)', ig], ['var(--tt)', tt]].filter(([, s]) => s.length > 1);
  if (!series.length) return <div className="vacio">La línea aparece después del segundo día de lecturas.</div>;
  const todas = series.flatMap(([, s]) => s);
  const t0 = Math.min(...todas.map((d) => +new Date(d.fecha))), t1 = Math.max(...todas.map((d) => +new Date(d.fecha)));
  const v0 = Math.min(...todas.map((d) => d.v)), v1 = Math.max(...todas.map((d) => d.v));
  const W = 420, H = 170, m = 8;
  const x = (f) => m + ((+new Date(f) - t0) / Math.max(t1 - t0, 1)) * (W - 2 * m);
  const y = (v) => H - m - ((v - v0) / Math.max(v1 - v0, 1)) * (H - 2 * m - 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Seguidores en el tiempo">
      {series.map(([c, s], i) => (
        <g key={i}>
          <polyline fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" points={s.map((d) => `${x(d.fecha)},${y(d.v)}`).join(' ')} />
          <circle cx={x(s.at(-1).fecha)} cy={y(s.at(-1).v)} r="3.5" fill={c} />
        </g>
      ))}
    </svg>
  );
}

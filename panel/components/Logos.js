// Las marcas de cada red, dibujadas simples para que se reconozcan a cualquier tamaño.
export function LogoIG({ t = 20 }) {
  return (
    <svg width={t} height={t} viewBox="0 0 24 24" aria-label="Instagram" role="img" className="logo-red">
      <defs>
        <radialGradient id="igg" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#fdf497" /><stop offset=".05" stopColor="#fdf497" />
          <stop offset=".45" stopColor="#fd5949" /><stop offset=".6" stopColor="#d6249f" /><stop offset=".9" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#igg)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="16.3" cy="7.7" r="1.05" fill="#fff" />
    </svg>
  );
}

const NOTA = 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';

export function LogoTT({ t = 20 }) {
  return (
    <svg width={t} height={t} viewBox="0 0 24 24" aria-label="TikTok" role="img" className="logo-red">
      <rect x="0" y="0" width="24" height="24" rx="6.5" fill="#111" />
      <g transform="translate(5 4.2) scale(.62)">
        <path d={NOTA} fill="#25F4EE" transform="translate(-1 -1)" />
        <path d={NOTA} fill="#FE2C55" transform="translate(1 1)" />
        <path d={NOTA} fill="#fff" />
      </g>
    </svg>
  );
}

// Para dibujar dentro de otro SVG (el gráfico).
export function MarcaIG({ x, y, t = 18 }) {
  return <g transform={`translate(${x - t / 2} ${y - t / 2}) scale(${t / 24})`}><LogoIGPlano /></g>;
}
function LogoIGPlano() {
  return (
    <g>
      <rect x="1" y="1" width="22" height="22" rx="6.5" fill="url(#igg)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#fff" strokeWidth="1.9" />
      <circle cx="16.3" cy="7.7" r="1.05" fill="#fff" />
    </g>
  );
}
export function MarcaTT({ x, y, t = 18 }) {
  return (
    <g transform={`translate(${x - t / 2} ${y - t / 2}) scale(${t / 24})`}>
      <rect width="24" height="24" rx="6.5" fill="#111" />
      <g transform="translate(5 4.2) scale(.62)">
        <path d={NOTA} fill="#25F4EE" transform="translate(-1 -1)" />
        <path d={NOTA} fill="#FE2C55" transform="translate(1 1)" />
        <path d={NOTA} fill="#fff" />
      </g>
    </g>
  );
}

function LogoYTPlano() {
  return (
    <g>
      <rect x="0" y="3" width="24" height="18" rx="5.5" fill="#ff0033" />
      <path d="M9.6 8.2v7.6l6.4-3.8z" fill="#fff" />
    </g>
  );
}
export function LogoYT({ t = 20 }) {
  return <svg width={t} height={t} viewBox="0 0 24 24" aria-label="YouTube" role="img" className="logo-red"><LogoYTPlano /></svg>;
}
export function MarcaYT({ x, y, t = 18 }) {
  return <g transform={`translate(${x - t / 2} ${y - t / 2}) scale(${t / 24})`}><LogoYTPlano /></g>;
}

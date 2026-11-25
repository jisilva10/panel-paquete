import Barra from '../../components/Barra';
import { cuentasConectadas } from '../../lib/cuentas';
import { cuandoCorto } from '../../lib/tiempo';
import * as yt from '../../lib/youtube';

export const dynamic = 'force-dynamic';

function Red({ red, nombre, clase, c, lista }) {
  return (
    <div className="carta">
      <div className="fila" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}><i className={`punto ${clase}`} style={{ marginRight: 8 }} />{nombre}</h2>
        {c ? <span className="chip bien">Conectado</span> : <span className="chip">Sin conectar</span>}
      </div>
      <p className="nota" style={{ margin: '12px 0 16px' }}>
        {c ? <>@{c.usuario || '—'} · {red === 'instagram' ? `la llave se renueva sola (vence ${cuandoCorto(c.expira)})` : `se renueva sola hasta ${cuandoCorto(c.refresh_expira)}`}</> : lista}
      </p>
      <a className={`boton ${c ? 'claro' : ''}`} href={`/api/conectar/${red}`}>{c ? 'Volver a conectar' : `Conectar ${nombre}`}</a>
    </div>
  );
}

export default async function Pagina({ searchParams }) {
  const q = await searchParams;
  let c = {};
  let fallo = q?.fallo;
  try { c = await cuentasConectadas(); } catch (e) { fallo = e.message; }
  return (
    <main className="marco">
      <Barra activo="/conectar" />
      <h1>Cuentas</h1>
      <p className="sub">Se conectan una sola vez. Las llaves quedan guardadas en el servidor; nunca en esta página.</p>
      {q?.listo && <div className="alerta bien">{q.listo === 'instagram' ? 'Instagram' : 'TikTok'} quedó conectado.</div>}
      {fallo && <div className="alerta mal">{fallo}</div>}
      <section className="rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Red red="instagram" nombre="Instagram" clase="ig" c={c.instagram} lista="Entra con la cuenta nueva (profesional de creador). Publica los reels solo y lee sus números." />
        <Red red="tiktok" nombre="TikTok" clase="tt" c={c.tiktok} lista="Entra con la cuenta nueva, no la personal. Deja el video en tus borradores y lee sus números." />
        <div className="carta">
          <div className="fila" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}><i className="punto yt" style={{ marginRight: 8 }} />YouTube</h2>
            {yt.listo() ? <span className="chip bien">Leyendo números</span> : <span className="chip">Falta la llave</span>}
          </div>
          <p className="nota" style={{ margin: '12px 0 0' }}>{yt.listo() ? <>Canal {c.youtube?.usuario ? `@${c.youtube.usuario}` : process.env.YT_CANAL}. Los Shorts los subes tú desde la app con la tarjeta «Subir a YouTube»; aquí se leen sus números cada 3 horas.</> : 'Se lee con una llave de Google (YT_API_KEY) y el id del canal (YT_CANAL), que van en Vercel. No hace falta conectar nada aquí.'}</p>
        </div>
      </section>
      <div className="espacio" />
      <form action="/api/salir" method="post"><button className="boton claro chico">Salir del panel</button></form>
    </main>
  );
}

import Barra from '../../components/Barra';
import { cuentasConectadas } from '../../lib/cuentas';
import { cuandoCorto } from '../../lib/tiempo';
import * as yt from '../../lib/youtube';
import { directo } from '../../lib/tiktok';

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
      {q?.listo && <div className="alerta bien">{q.listo === 'youtube_fuera' ? 'YouTube quedó desconectado para subir (la llave se anuló en Google).' : `${({ instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' })[q.listo] || q.listo} quedó conectado.`}</div>}
      {fallo && <div className="alerta mal">{fallo}</div>}
      <section className="rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Red red="instagram" nombre="Instagram" clase="ig" c={c.instagram} lista="Entra con la cuenta nueva (profesional de creador). Publica los reels solo y lee sus números." />
        <Red red="tiktok" nombre="TikTok" clase="tt" c={c.tiktok} lista={directo() ? 'Entra con la cuenta nueva, no la personal. Publica los videos que apruebes en el panel (los demás quedan en tus borradores) y lee sus números.' : 'Entra con la cuenta nueva, no la personal. Deja el video en tus borradores y lee sus números.'} />
        <div className="carta">
          <div className="fila" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}><i className="punto yt" style={{ marginRight: 8 }} />YouTube</h2>
            {c.youtube?.para_subir ? <span className="chip bien">{yt.subirSolo() ? 'Sube solo' : 'Conectado'}</span> : yt.listo() ? <span className="chip bien">Leyendo números</span> : <span className="chip">Falta la llave</span>}
          </div>
          <p className="nota" style={{ margin: '12px 0 0' }}>{yt.listo() ? <>Canal {c.youtube?.usuario ? `@${c.youtube.usuario}` : process.env.YT_CANAL}. Sus números se leen cada 3 horas.</> : 'Los números se leen con una llave de Google (YT_API_KEY) y el id del canal (YT_CANAL), que van en Vercel.'}</p>
          <p className="nota" style={{ margin: '8px 0 16px' }}>{c.youtube?.para_subir
            ? (yt.subirSolo() ? 'Conectado para subir: los Shorts salen solos a su hora.' : 'Conectado para subir. La subida sola todavía está apagada: por ahora sigue la tarjeta «Subir».')
            : 'Subir solo: conecta el canal una vez con el permiso de subir videos. Hasta entonces los Shorts los subes tú con la tarjeta «Subir».'}</p>
          {yt.oauthListo() && (
            <div className="fila" style={{ gap: 8 }}>
              <a className={`boton ${c.youtube?.para_subir ? 'claro' : ''}`} href="/api/conectar/youtube">{c.youtube?.para_subir ? 'Volver a conectar' : 'Conectar YouTube para subir'}</a>
              {c.youtube?.para_subir && <form action="/api/conectar/youtube/quitar" method="post"><button className="boton claro">Desconectar</button></form>}
            </div>
          )}
        </div>
      </section>
      <div className="espacio" />
      <form action="/api/salir" method="post"><button className="boton claro chico">Salir del panel</button></form>
    </main>
  );
}

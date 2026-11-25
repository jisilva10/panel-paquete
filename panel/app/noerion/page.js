import Barra from '../../components/Barra';
import Tablero from '../../components/Tablero';
import { noerion } from '../../lib/noerion';

export const dynamic = 'force-dynamic';

export default async function Noerion() {
  let r, fallo;
  try {
    const res = await noerion('resumen');
    if (!res.ok) throw new Error(`el panel de Noerion respondió ${res.status}`);
    r = await res.json();
  } catch (e) { fallo = e.message; }
  return (
    <main className="pantalla">
      <Barra activo="/noerion" cuenta="noerion" />
      {fallo ? <div className="alerta mal">No pude leer Noerion: {fallo}</div> : (
        <>
          {r.errores?.length > 0 && <div className="alerta mal">{r.errores[0].detalle}</div>}
          <Tablero r={r} api="/api/noerion" gana={false} />
        </>
      )}
    </main>
  );
}

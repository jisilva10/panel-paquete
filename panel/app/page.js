import Barra from '../components/Barra';
import Tablero from '../components/Tablero';
import AvisoError from '../components/AvisoError';
import { resumen } from '../lib/resumen';
import { directo } from '../lib/tiktok';

export const dynamic = 'force-dynamic';

export default async function Inicio() {
  let r;
  try { r = await resumen(); } catch (e) {
    return <main className="pantalla"><Barra activo="/" /><div className="alerta mal">No pude leer la base: {e.message}</div></main>;
  }
  const falta = ['instagram', 'tiktok', 'youtube'].filter((x) => !r.cuentas[x]).map((x) => ({ instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' })[x]);
  return (
    <main className="pantalla">
      <Barra activo="/" />
      {falta.length > 0 && <div className="alerta">Falta conectar {falta.join(', ')}. <a href="/conectar">Conectar →</a></div>}
      {r.errores.length > 0 && <AvisoError errores={r.errores} />}
      <Tablero r={r} vistazo ttDirecto={directo()} />
    </main>
  );
}

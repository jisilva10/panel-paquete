import Cabecera, { Pie } from '../components/enserio/Cabecera';
import Inicio from '../components/enserio/Inicio';
import AvisoError from '../components/AvisoError';
import { resumen } from '../lib/resumen';
import { directo } from '../lib/tiktok';

export const dynamic = 'force-dynamic';

export default async function Pagina() {
  let r;
  try { r = await resumen(); } catch (e) {
    return <main className="ps"><Cabecera /><div className="alerta mal">No pude leer la base: {e.message}</div></main>;
  }
  const falta = ['instagram', 'tiktok', 'youtube'].filter((x) => !r.cuentas[x]).map((x) => ({ instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube' })[x]);
  return (
    <main className="ps">
      <Cabecera />
      {falta.length > 0 && <div className="alerta">Falta conectar {falta.join(', ')}. <a href="/conectar">Conectar →</a></div>}
      {r.errores.length > 0 && <AvisoError errores={r.errores} />}
      <Inicio r={r} ttDirecto={directo()} />
      <Pie />
    </main>
  );
}

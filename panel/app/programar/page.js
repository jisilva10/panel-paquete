import Barra from '../../components/Barra';
import Programar from '../../components/Programar';
import { db } from '../../lib/db';
import { cuentasConectadas } from '../../lib/cuentas';
import { enDemo, colaDemo } from '../../lib/demo';
import { directo } from '../../lib/tiktok';
import { subirSolo } from '../../lib/youtube';

export const dynamic = 'force-dynamic';

export default async function Pagina() {
  const [{ data: cola }, cuentas] = enDemo() ? [{ data: colaDemo() }, { instagram: { usuario: 'cuenta.demo' }, tiktok: { usuario: 'cuenta.demo' } }] : await Promise.all([
    db().from('publicaciones').select('*').order('programada_para', { ascending: false }).limit(40),
    cuentasConectadas(),
  ]);
  return (
    <main className="marco">
      <Barra activo="/programar" />
      <h1>Programar</h1>
      <p className="sub">Sueltas el MP4, pones el texto y la hora. A esa hora sale solo.</p>
      <Programar cola={cola || []} cuentas={cuentas} ttDirecto={directo()} ytSolo={subirSolo() && !!cuentas.youtube?.para_subir} />
    </main>
  );
}

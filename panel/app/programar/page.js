import Cabecera from '../../components/enserio/Cabecera';
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
    <main className="ps ps-angosto">
      <Cabecera volver />
      <h1 className="ps-titulo">La cola</h1>
      <Programar cola={cola || []} cuentas={cuentas} ttDirecto={directo()} ytSolo={subirSolo() && !!cuentas.youtube?.para_subir} />
    </main>
  );
}

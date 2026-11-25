import { NextResponse } from 'next/server';
import { base } from '../../../../../lib/sesion';
import { guardarCuenta } from '../../../../../lib/cuentas';
import { anotar } from '../../../../../lib/db';
import * as ig from '../../../../../lib/instagram';
import * as tt from '../../../../../lib/tiktok';

export async function GET(req, { params }) {
  const { red } = await params;
  const u = new URL(req.url);
  const ir = (q) => NextResponse.redirect(`${base(req)}/conectar?${q}`, 303);
  if (u.searchParams.get('error')) return ir(`fallo=${encodeURIComponent(u.searchParams.get('error_description') || u.searchParams.get('error'))}`);
  if (u.searchParams.get('state') !== req.cookies.get(`estado_${red}`)?.value) return ir('fallo=La%20sesi%C3%B3n%20de%20conexi%C3%B3n%20venci%C3%B3%2C%20prueba%20otra%20vez');
  const vuelta = `${base(req)}/api/conectar/${red}/vuelta`;
  try {
    const datos = red === 'instagram' ? await ig.canjearCodigo(u.searchParams.get('code'), vuelta) : await tt.canjearCodigo(u.searchParams.get('code'), vuelta);
    await guardarCuenta(red, datos);
    await anotar('conectado', `${red} @${datos.usuario || ''}`);
    return ir(`listo=${red}`);
  } catch (e) {
    return ir(`fallo=${encodeURIComponent(e.message)}`);
  }
}

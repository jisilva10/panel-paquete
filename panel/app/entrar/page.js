import Logo from '../../components/Logo';

export default async function Entrar({ searchParams }) {
  const q = await searchParams;
  return (
    <main className="marco" style={{ maxWidth: 380, paddingTop: '18vh' }}>
      <div style={{ marginBottom: 22 }}><Logo alto={26} /></div>
      <h1 style={{ marginBottom: 18 }}>Panel</h1>
      <form action="/api/entrar" method="post" className="carta">
        {q?.mal && <div className="alerta mal">Esa no es.</div>}
        <label className="campo"><span>Clave</span><input type="password" name="clave" autoFocus autoComplete="current-password" /></label>
        <button className="boton" style={{ width: '100%' }}>Entrar</button>
      </form>
      <p className="nota" style={{ marginTop: 16, textAlign: 'center' }}>
        Herramienta privada de es_enserio.tv para programar y publicar su propio contenido en Instagram, TikTok y YouTube.
        <br /><a className="enlace" href="/privacidad">Privacidad</a> · <a className="enlace" href="/terminos">Términos</a>
      </p>
    </main>
  );
}

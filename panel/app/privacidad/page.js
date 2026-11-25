import Logo from '../../components/Logo';
export const metadata = { title: 'Privacidad · Panel' };
export default function Privacidad() {
  return (
    <main className="marco texto-largo">
      <div style={{ marginBottom: 28 }}><Logo /></div>
      <h1>Política de privacidad</h1>
      <p>Última actualización: 25 de noviembre de 2026.</p>
      <p>Este panel es la herramienta interna con la que un creador independiente de Quito, Ecuador, publica su propio contenido en Instagram, TikTok y YouTube y lee las estadísticas de sus propias cuentas.</p>
      <h2>Qué datos usa</h2>
      <ul>
        <li>Los videos, portadas y textos que el autor sube para publicar.</li>
        <li>De las cuentas que se conectan: nombre de usuario, identificador, número de seguidores y las estadísticas de cada publicación (vistas, alcance, me gusta, comentarios, guardados, compartidos y tiempo de reproducción).</li>
        <li>Las llaves de acceso que entregan Instagram y TikTok al conectar la cuenta.</li>
      </ul>
      <h2>Para qué</h2>
      <p>Solo para publicar su propio contenido a la hora programada y mostrar sus resultados en el panel. No se venden, no se comparten con terceros y no se usan para publicidad.</p>
      <h2>Dónde se guardan</h2>
      <p>En una base de datos privada (Supabase) y en un almacén de archivos (Vercel). Los videos se borran del almacén en cuanto salen publicados. Las llaves de acceso solo las lee el servidor.</p>
      <h2>Cómo borrarlos</h2>
      <p>Al desconectar la aplicación desde la configuración de Instagram o TikTok, la llave deja de servir. Para borrar todos los datos guardados, escriba por mensaje directo a la cuenta en Instagram y se eliminan en un máximo de 7 días.</p>
    </main>
  );
}

import Logo from '../../components/Logo';
export const metadata = { title: 'Privacidad · Panel' };
export default function Privacidad() {
  return (
    <main className="marco texto-largo">
      <div style={{ marginBottom: 28 }}><Logo /></div>
      <h1>Política de privacidad</h1>
      <p>Última actualización: 25 de noviembre de 2026.</p>
      <p>Este panel es la herramienta con la que un creador independiente de Quito, Ecuador, programa y publica su propio contenido en Instagram, TikTok y YouTube y lee las estadísticas de sus propias cuentas. El panel usa los servicios de la API de YouTube (YouTube API Services), la API de Instagram y las API de TikTok (Login Kit, Display API y Content Posting API).</p>
      <h2>Qué datos usa</h2>
      <ul>
        <li>Los videos, portadas y textos que el autor sube para publicar, y la privacidad y los ajustes que elige para cada publicación.</li>
        <li>De las cuentas que se conectan: nombre de usuario, apodo, foto de perfil, identificador, número de seguidores y las estadísticas de cada publicación (vistas, alcance, me gusta, comentarios, guardados, compartidos y tiempo de reproducción).</li>
        <li>De TikTok, además, lo que TikTok informa al momento de publicar: las opciones de privacidad disponibles, si la cuenta tiene apagados los comentarios, dúos o stitch, y la duración máxima permitida.</li>
        <li>De YouTube: con el permiso «youtube.upload», solo se suben los videos que el autor programa, con el título, la descripción y la privacidad que él elige. Los números públicos del canal se leen con una llave de la API de YouTube.</li>
        <li>Las llaves de acceso que entregan Instagram, TikTok y Google al conectar la cuenta.</li>
      </ul>
      <h2>Para qué</h2>
      <p>Solo para publicar el contenido del propio autor a la hora programada, con los ajustes que él aprobó, y mostrarle sus resultados en el panel. No se venden, no se comparten con terceros, no se usan para publicidad y no se combinan con datos de otras fuentes.</p>
      <h2>Dónde se guardan y por cuánto tiempo</h2>
      <p>En una base de datos privada (Supabase) y en un almacén de archivos (Vercel). Los videos y portadas se borran del almacén en cuanto salen publicados en todas las redes. Las llaves de acceso solo las lee el servidor y nunca se muestran en el navegador. Las estadísticas se guardan mientras la cuenta siga conectada; los datos obtenidos de YouTube se actualizan o se borran a más tardar a los 30 días.</p>
      <h2>YouTube y Google</h2>
      <p>Al conectar YouTube, usted acepta las <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Condiciones del Servicio de YouTube</a>. El uso de los datos de Google también se rige por la <a href="http://www.google.com/policies/privacy" target="_blank" rel="noreferrer">Política de Privacidad de Google</a>.</p>
      <p>Puede quitar el acceso del panel a su cuenta de Google en cualquier momento desde la <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noreferrer">página de permisos de seguridad de Google</a>, o con el botón «Desconectar» de la página Cuentas del panel, que anula la llave en Google al instante.</p>
      <h2>Cómo borrarlos</h2>
      <p>Al desconectar la aplicación desde la configuración de Instagram, TikTok o Google, o desde el panel, la llave deja de servir y el panel ya no puede leer ni publicar nada. Para borrar todos los datos guardados, o para cualquier pregunta, escriba por mensaje directo a @es_enserio.tv en Instagram o TikTok y se eliminan en un máximo de 7 días.</p>
    </main>
  );
}

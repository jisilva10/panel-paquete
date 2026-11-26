import Logo from '../../components/Logo';
export const metadata = { title: 'Términos · Panel' };
export default function Terminos() {
  return (
    <main className="marco texto-largo">
      <div style={{ marginBottom: 28 }}><Logo /></div>
      <h1>Términos de uso</h1>
      <p>Última actualización: 25 de noviembre de 2026.</p>
      <p>Este panel es una herramienta privada de un creador independiente de Quito, Ecuador, para programar y publicar su propio contenido en Instagram, TikTok y YouTube y ver sus estadísticas. Solo lo usa el titular de las cuentas.</p>
      <ul>
        <li>Nada se publica sin que el titular lo haya programado de forma expresa, con su texto, su video y su hora.</li>
        <li>En TikTok, el video llega a los borradores del titular, que decide publicarlo desde la app de TikTok; o, si el titular lo aprobó antes en el panel eligiendo quién puede verlo y qué interacciones permite, se publica a la hora programada.</li>
        <li>En YouTube, el video se sube con el título, la descripción y la privacidad que elige el titular.</li>
        <li>Al usar la conexión con YouTube, usted acepta las <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer">Condiciones del Servicio de YouTube</a> y la <a href="http://www.google.com/policies/privacy" target="_blank" rel="noreferrer">Política de Privacidad de Google</a>. Al publicar en TikTok, acepta la <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Confirmación de uso de música de TikTok</a>.</li>
        <li>El contenido es responsabilidad de su autor y cumple las normas de cada plataforma.</li>
        <li>El acceso a cada red se puede retirar en cualquier momento desde la configuración de esa red o desde la página Cuentas del panel. Vea la <a href="/privacidad">política de privacidad</a>.</li>
      </ul>
    </main>
  );
}

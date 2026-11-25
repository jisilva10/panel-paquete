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
        <li>En TikTok el video llega a los borradores del titular, que es quien decide publicarlo desde la app de TikTok.</li>
        <li>El contenido es responsabilidad de su autor y cumple las normas de cada plataforma.</li>
        <li>El acceso a cada red se puede retirar en cualquier momento desde la configuración de esa red.</li>
      </ul>
    </main>
  );
}

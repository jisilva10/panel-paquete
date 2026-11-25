import { NOMBRE } from '../lib/marca';
export default function manifest() {
  return {
    name: NOMBRE,
    short_name: NOMBRE,
    description: 'Cómo va el contenido y qué sale hoy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5efe2',
    theme_color: '#f5efe2',
    lang: 'es',
    icons: [
      { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icono-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

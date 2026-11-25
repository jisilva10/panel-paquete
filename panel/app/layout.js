import './globals.css';
import SinZoom from '../components/SinZoom';
import { NOMBRE } from '../lib/marca';

export const metadata = {
  title: `${NOMBRE} · Panel`,
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: NOMBRE, statusBarStyle: 'default' },
};
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#f5efe2',
  colorScheme: 'light',
};

export default function Raiz({ children }) {
  return (
    <html lang="es">
      <body><SinZoom />{children}</body>
    </html>
  );
}

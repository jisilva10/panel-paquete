'use client';
import { useEffect } from 'react';

// iPhone ignora «no zoom» en el viewport: se frena el pellizco aquí.
export default function SinZoom() {
  useEffect(() => {
    const parar = (e) => e.preventDefault();
    document.addEventListener('gesturestart', parar);
    document.addEventListener('gesturechange', parar);
    const dos = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    document.addEventListener('touchmove', dos, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', parar);
      document.removeEventListener('gesturechange', parar);
      document.removeEventListener('touchmove', dos);
    };
  }, []);
  return null;
}

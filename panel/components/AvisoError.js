'use client';
import { useEffect, useState } from 'react';

// Aviso rojo de errores con «×» para quitarlo (JIS, 25/11/2026). Se recuerda en este teléfono/compu:
// un error quitado no vuelve a salir; uno NUEVO sí aparece.
const CLAVE = 'avisos-quitados';
const leer = () => { try { return JSON.parse(localStorage.getItem(CLAVE) || '[]'); } catch { return []; } };

export default function AvisoError({ errores }) {
  const [quitados, setQuitados] = useState(null);
  useEffect(() => { setQuitados(leer()); }, []);
  if (quitados === null) return null;
  const visibles = errores.filter((e) => !quitados.includes(e.id));
  if (!visibles.length) return null;
  const quitar = () => {
    const n = [...new Set([...quitados, ...visibles.map((e) => e.id)])].slice(-200);
    try { localStorage.setItem(CLAVE, JSON.stringify(n)); } catch {}
    setQuitados(n);
  };
  return (
    <div className="alerta mal" style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }} title={visibles.map((e) => e.detalle).join('\n')}>
      <span style={{ flex: 1 }}>{visibles[0].detalle}{visibles.length > 1 ? ` (y ${visibles.length - 1} más)` : ''}</span>
      <button onClick={quitar} aria-label="Quitar aviso" style={{ font: 'inherit', fontSize: 20, lineHeight: 1, background: 'none', border: 0, color: 'inherit', cursor: 'pointer', padding: '0 4px' }}>×</button>
    </div>
  );
}

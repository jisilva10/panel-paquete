import Logo from '../Logo';

// Arriba de todo en ¿En serio?: la marca y el cambio de cuenta (sin salir de esta dirección).
export default function Cabecera({ volver = false }) {
  return (
    <header className="ps-cab">
      <a href="/" className="ps-marca" aria-label="Inicio">{volver && <span className="ps-volver" aria-hidden>‹</span>}<Logo /></a>
      <nav className="ps-cuentas" aria-label="Cuenta">
        <a href="/" className="activo">¿En serio?</a>
        <a href="/noerion">Noerion</a>
      </nav>
    </header>
  );
}

export function Pie() {
  return (
    <footer className="ps-pie">
      <a href="/programar">Subir a mano</a>
      <span aria-hidden>·</span>
      <a href="/conectar">Cuentas</a>
    </footer>
  );
}

import Logo from './Logo';

// Un solo panel para las dos cuentas: el interruptor cambia de cuenta sin salir de esta dirección
// (así funciona igual en la app agregada a la pantalla de inicio).
export default function Barra({ activo, cuenta = 'enserio' }) {
  const ir = cuenta === 'noerion' ? [['/noerion', 'Cómo va']] : [['/', 'Cómo va'], ['/programar', 'Programar'], ['/conectar', 'Cuentas']];
  return (
    <div className="barra">
      <div className="barra-izq">
        <a href="/" className="marca" aria-label="Inicio"><Logo /></a>
        <nav className="cuentas-sw" aria-label="Cuenta">
          <a href="/" className={cuenta === 'enserio' ? 'activo' : ''}>¿En serio?</a>
          <a href="/noerion" className={cuenta === 'noerion' ? 'activo' : ''}>Noerion</a>
        </nav>
      </div>
      <nav className="nav">
        {ir.map(([href, t]) => <a key={href} href={href} className={activo === href ? 'activo' : ''}>{t}</a>)}
      </nav>
    </div>
  );
}

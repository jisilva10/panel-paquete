"""Copia las palancas de etiquetas.json dentro del que-se-hizo.txt (bloque «== PALANCAS ==»), para que el texto
tenga TODO lo que se probó y se pueda comparar sin abrir nada más. Revisa además que cada valor esté escrito igual que
en .motor/variables.json (si no, el laboratorio no lo puede comparar).
Lo llama limpiar.py solo; a mano: python .motor/palancas.py "2 Funciones/NNN. Título"   (devuelve 1 si algo está mal)"""
import json, os, re, sys
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # la consola de Windows no siempre es UTF-8
except Exception: pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VARS = json.load(open(os.path.join(RAIZ, '.motor', 'variables.json'), encoding='utf8'))['variables']
GRUPOS = (('H', 'Historia'), ('A', 'Texto'), ('B', 'Edición y sonido'), ('C', 'Voz, duración, portada'), ('-', 'Publicación'))

def escribir(carpeta):
    e = json.load(open(os.path.join(carpeta, 'etiquetas.json'), encoding='utf8'))
    pruebas = e.get('pruebas') or []
    malos = [f'{k}={e.get(k)!r}' for k, v in VARS.items() if e.get(k) and e.get(k) not in v['opciones']]
    faltan = [k for k in VARS if not e.get(k) and k not in ('duracion', 'franja')]
    out = ['== PALANCAS == (copiado de etiquetas.json; ★ = se probó a propósito en este video)',
           f"Modo: {e.get('modo') or '—'} · Pruebas: {', '.join(pruebas) or '—'}"]
    for g, titulo in GRUPOS:
        celdas = [f"{'★ ' if k in pruebas else ''}{v['nombre']}: {e.get(k) or '—'}" for k, v in VARS.items() if v['grupo'] == g]
        out.append(f'{titulo}: ' + ' · '.join(celdas))
    bloque = '\n'.join(out) + '\n'
    p = os.path.join(carpeta, 'que-se-hizo.txt')
    t = open(p, encoding='utf8').read()
    if '== PALANCAS ==' in t: t = re.sub(r'== PALANCAS ==.*?\n(?=\n== )', bloque, t, count=1, flags=re.S)
    elif '== QUÉ SE PROBÓ ==' in t: t = t.replace('== QUÉ SE PROBÓ ==', bloque + '\n== QUÉ SE PROBÓ ==', 1)
    else: t += '\n' + bloque
    open(p, 'w', encoding='utf8').write(t)
    if malos: print('⚠️ valores que no están en variables.json (corrígelos o agrega la opción):', ', '.join(malos))
    if faltan: print('⚠️ palancas sin llenar en etiquetas.json:', ', '.join(faltan))
    return not malos and not faltan

if __name__ == '__main__':
    ok = escribir(sys.argv[1])
    print('palancas copiadas al que-se-hizo.txt' + ('' if ok else ' (con avisos)'))
    sys.exit(0 if ok else 1)

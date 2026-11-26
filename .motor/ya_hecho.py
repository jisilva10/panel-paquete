"""¿Ya se contó? Busca en todo lo hecho antes de elegir una historia, un gancho o un cierre.

Uso (desde la carpeta Titeres):
  python .motor\\ya_hecho.py "Eiffel" "Lustig"     → dice si ya salió algo con esas palabras (y dónde)
  python .motor\\ya_hecho.py --lista               → todos los videos hechos: tema, gancho y cierre

Mira: 2 Funciones/*/ (guion, que-se-hizo, texto, etiquetas), 3 Publicado/registro.csv y notas.md,
y lo tachado (~~ ~~) en 1 Historias/banco.md. Sin tildes ni mayúsculas.
Regla: si sale «YA SE HIZO», no se repite esa historia ni ese protagonista; los ganchos y cierres de --lista
no se copian literal (se aprende la forma, no se repite la frase).
"""
import os, re, sys, unicodedata

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARCHIVOS_FUNCION = ('guion.txt', 'que-se-hizo.txt', 'texto.txt', 'etiquetas.json')


def plano(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn')


def leer(p):
    try:
        with open(p, encoding='utf-8') as f:
            return f.read()
    except (OSError, UnicodeDecodeError):
        return ''


def fuentes():
    """(dónde, texto) de todo lo que ya se hizo."""
    fun = os.path.join(RAIZ, '2 Funciones')
    if os.path.isdir(fun):
        for d in sorted(os.listdir(fun)):
            carpeta = os.path.join(fun, d)
            if not os.path.isdir(carpeta):
                continue
            yield f'2 Funciones/{d} (título)', d
            for a in ARCHIVOS_FUNCION:
                t = leer(os.path.join(carpeta, a))
                if t:
                    yield f'2 Funciones/{d}/{a}', t
    for a in ('registro.csv', 'notas.md'):
        t = leer(os.path.join(RAIZ, '3 Publicado', a))
        if t:
            yield f'3 Publicado/{a}', t
    banco = leer(os.path.join(RAIZ, '1 Historias', 'banco.md'))
    tachado = '\n'.join(m for m in re.findall(r'~~(.+?)~~', banco))
    if tachado:
        yield '1 Historias/banco.md (tachado = ya salió)', tachado


def buscar(palabras):
    claves = [plano(p) for p in palabras if p.strip()]
    hallado = False
    for donde, texto in fuentes():
        for linea in texto.splitlines():
            lp = plano(linea)
            if any(c in lp for c in claves):
                if not hallado:
                    print('YA SE HIZO algo con eso:')
                hallado = True
                print(f'  · {donde}: {linea.strip()[:160]}')
    if not hallado:
        print('Nuevo: no aparece en nada de lo hecho.')
    return hallado


def campo(texto, *nombres):
    for n in nombres:
        m = re.search(rf'^\s*{re.escape(n)}\s*[:=][ \t]*(\S.*)$', texto, re.I | re.M)
        if m:
            return m.group(1).strip()[:120]
    return '—'


def lista():
    fun = os.path.join(RAIZ, '2 Funciones')
    dirs = sorted(d for d in os.listdir(fun) if os.path.isdir(os.path.join(fun, d))) if os.path.isdir(fun) else []
    if not dirs:
        print('Todavía no hay videos hechos.')
    for d in dirs:
        q = leer(os.path.join(fun, d, 'que-se-hizo.txt'))
        print(f'{d}\n  tema: {campo(q, "Tipo")}\n  gancho: {campo(q, "Gancho (primera frase, literal)")}\n  cierre: {campo(q, "Frase de cierre (literal)")}')


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args == ['--lista']:
        lista()
    else:
        sys.exit(1 if buscar(args) else 0)

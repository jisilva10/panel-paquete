"""Quién gana y por qué, sin ver ningún video.
1. Lee los números del panel (con la llave de esta compu).
2. Busca la carpeta de cada pieza por su nombre: «2 Funciones/<nombre en el panel>».
3. Ordena las de más de 48 h por un puntaje (vistas relativas en cada red, más compartidos y guardados).
4. Escribe el resultado dentro de cada que-se-hizo.txt y deja «3 Publicado/ganadores.md» con las fichas
   de las mejores y las peores, para que la rutina escriba los guiones nuevos copiando lo que gana.
Uso: python .motor/ganadores.py"""
import datetime, json, os, re, sys, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Los temas (para agrupar «Por tema»; no rotan: se eligen las mejores historias, de 3 temas distintos por día).
TEMAS = ['noticia/tendencia', 'historia absurda', 'persona increíble', 'error de millones', 'golpe/estafa',
         'política', 'crimen', 'inventos y ciencia', 'latinoamérica']
FUN = os.path.join(RAIZ, '2 Funciones')
SEC = os.path.join(RAIZ, 'panel', '.secretos')

def leer(f):
    try: return open(os.path.join(SEC, f), encoding='utf8').read().strip()
    except OSError: return None

def resumen():
    url = (leer('url.txt') or 'https://funciones-panel.vercel.app').rstrip('/')
    req = urllib.request.Request(url + '/api/resumen', headers={'Authorization': 'Bearer ' + (leer('mac.txt') or '')})
    with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)

def ficha(nombre):
    p = os.path.join(FUN, nombre, 'que-se-hizo.txt')
    if not os.path.exists(p): return None, {}
    t = open(p, encoding='utf8').read()
    campos = {}
    for l in t.split('== GUION COMPLETO ==')[0].splitlines():
        m = re.match(r'^([A-ZÁÉÍÓÚÑa-záéíóúñ ()/]+):\s*(.+)$', l)
        if m and m.group(2).strip() and not m.group(2).startswith('('): campos[m.group(1).strip()] = m.group(2).strip()
    return p, campos

def main():
    r = resumen()
    ahora = datetime.datetime.now(datetime.timezone.utc)
    piezas = [p for p in r.get('piezas', []) if p.get('fecha')]
    maduras = [p for p in piezas if (ahora - datetime.datetime.fromisoformat(p['fecha'].replace('Z', '+00:00'))).total_seconds() > 48 * 3600]
    # puntaje: percentil de vistas en cada red (las redes no se suman) + empuje de compartidos y guardados
    def pct(red, v):
        vals = sorted(x[red]['vistas'] for x in maduras if x.get(red) and x[red].get('vistas') is not None)
        return sum(1 for x in vals if x <= v) / len(vals) if vals else None
    for p in maduras:
        ps = [pct(red, p[red]['vistas']) for red in ('tiktok', 'instagram', 'youtube') if p.get(red) and p[red].get('vistas') is not None]
        ig = p.get('instagram') or {}
        empuje = ((ig.get('compartidos') or 0) + (ig.get('guardados') or 0)) / max(1, ig.get('vistas') or 1)
        p['puntaje'] = round((sum(ps) / len(ps) if ps else 0) + min(0.3, empuje * 10), 3)
    maduras.sort(key=lambda p: -p['puntaje'])
    # el resultado se escribe dentro de cada que-se-hizo.txt
    for p in maduras:
        ruta, _ = ficha(p['pieza'])
        if not ruta: continue
        v = lambda red: (p.get(red) or {}).get('vistas')
        ret = f"{round(p['retencion'] * 100)} %" if p.get('retencion') else '—'
        linea = f"48 h · TikTok: {v('tiktok') or '—'}  Instagram: {v('instagram') or '—'}  YouTube: {v('youtube') or '—'}  Retención IG: {ret}  · puntaje {p['puntaje']} (puesto {maduras.index(p) + 1} de {len(maduras)})"
        t = open(ruta, encoding='utf8').read()
        t = re.sub(r'^48 h · TikTok:.*$', linea, t, count=1, flags=re.M)
        open(ruta, 'w', encoding='utf8').write(t)
    # el resumen para la rutina
    out = [f'# Ganadores · {ahora.astimezone().strftime("%Y-%m-%d %H:%M")}', '',
           f'{len(maduras)} piezas con más de 48 h. Puntaje = vistas relativas en cada red (0-1) + compartidos y guardados.', '']
    def bloque(titulo, lista):
        out.append(f'## {titulo}')
        for p in lista:
            _, c = ficha(p['pieza'])
            out.append(f"\n### {p['pieza']} · puntaje {p['puntaje']}")
            if not c: out.append('(sin que-se-hizo.txt: pieza de antes del sistema)'); continue
            ruta, _ = ficha(p['pieza'])
            txt = open(ruta, encoding='utf8').read()
            m = re.search(r'== PALANCAS ==.*?\n(.*?)\n\n== ', txt, re.S)
            if m: out += ['- Palancas:'] + ['  ' + l for l in m.group(1).splitlines()]
            for k in ('Tipo', 'Tema en una frase', 'Duración (s)', 'Primera palabra', 'Gancho (primera frase, literal)', 'Tipo de gancho', 'Estructura',
                      'Narrador en', 'Ritmo de la voz', 'Cierre (estilo)', 'Frase de cierre (literal)', 'Mundo (lugar de papel)', 'Fotos reales (cuántas, de dónde, en qué segundo)',
                      'Clips reales (cuántos, de dónde, cuánto duran, cómo entran)', 'Subtítulos (estilo, tamaño, posición)', 'Portada (escena y titular)',
                      'Lo nuevo que se probó en este video', 'Lectura'):
                if c.get(k): out.append(f'- {k}: {c[k]}')
    bloque('Los que más ganan (copiar)', maduras[:3])
    out.append('')
    bloque('Los que menos (evitar)', maduras[-3:] if len(maduras) > 3 else [])
    # ── Por tema: el mejor y el peor de cada uno (para escribir mejor CADA tema, no para quedarse con uno) ──
    def tema(p):
        _, c = ficha(p['pieza'])
        t = (c.get('Tipo') or '').lower()
        return next((k for k in TEMAS if k.split(' ')[0] in t), 'otro')
    por_tema = {}
    for p in maduras: por_tema.setdefault(tema(p), []).append(p)
    out += ['', '## Por tema (mejor → peor dentro de cada uno)']
    for k in TEMAS + ['otro']:
        lst = por_tema.get(k, [])
        if not lst: out.append(f'- {k}: sin piezas todavía'); continue
        out.append(f"- {k}: {len(lst)} piezas · mejor «{lst[0]['pieza']}» ({lst[0]['puntaje']}) · peor «{lst[-1]['pieza']}» ({lst[-1]['puntaje']})")
    # (Ya no hay rotación fija de temas: los temas, las horas y las pruebas de cada video los reparte laboratorio.py.)
    out += ['', '## Qué probar ahora', 'Corre `python .motor/laboratorio.py`: dice qué palanca va ganando, el plan del próximo video (base + pruebas), las horas de hoy y los temas que faltan.']
    jovenes = [p['pieza'] for p in piezas if p not in maduras]
    out += ['', '## Aún sin 48 h (no decidir con estas)', *[f'- {n}' for n in jovenes]]
    dest = os.path.join(RAIZ, '3 Publicado', 'ganadores.md')
    open(dest, 'w', encoding='utf8').write('\n'.join(out) + '\n')
    print('\n'.join(out[:40]))
    print(f'\n→ {dest}')

main()

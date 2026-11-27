"""El laboratorio: qué gana en cada palanca y qué probar en el próximo video.
Lo corre CADA video (los 3 del día) ANTES de elegir la historia (JIS, 26/11/2026: «que cada video abra el panel, vea
qué gana, abra los ganadores en el txt y después edite siempre probando cosas nuevas en la misma línea de los ganadores»).

1. Lee los números del panel (/api/resumen) y el etiquetas.json + que-se-hizo.txt de cada función.
2. Por cada palanca de .motor/variables.json: cuántos videos usó cada opción y cómo les fue (solo los de 48 h o más).
3. Arma el PLAN del próximo video: la BASE (lo que va ganando, o lo de siempre si aún no hay datos) + las PRUEBAS
   (lo que se cambia a propósito: lo menos probado primero, sin repetir lo que ya prueba otro video de hoy).
4. Reparte la hora de subida del día (3 franjas distintas, rotando) y dice qué temas faltan.

Uso:
  python .motor/laboratorio.py                       → imprime el informe y el plan del próximo video
  python .motor/laboratorio.py --guardar             → además lo deja en «3 Publicado/laboratorio.md» (video 1)
  python .motor/laboratorio.py --carpeta "2 Funciones/NNN. Título"
        → escribe el plan dentro del etiquetas.json de esa función (base + pruebas + modo); después se ajusta a la historia
  --video K   (1, 2 o 3) qué video del día es (si no, se cuenta solo)
"""
import datetime, hashlib, json, os, re, sys, urllib.request
try: sys.stdout.reconfigure(encoding='utf-8', errors='replace')  # la consola de Windows no siempre es UTF-8
except Exception: pass

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUN = os.path.join(RAIZ, '2 Funciones')
SEC = os.path.join(RAIZ, 'panel', '.secretos')
VARS = json.load(open(os.path.join(RAIZ, '.motor', 'variables.json'), encoding='utf8'))['variables']
INICIO = datetime.date(2026, 11, 25)           # primer video de la cuenta
SEMANA_4 = INICIO + datetime.timedelta(days=21)  # desde aquí: 7 ganador · 2 rival · 1 nuevo
HORA_FRANJA = {'mañana (7-10)': '08:30', 'mediodía (11-13)': '12:00', 'tarde (14-17)': '15:30',
               'noche (18-20)': '19:00', 'noche tarde (21-23)': '21:45'}

args = sys.argv[1:]
def arg(nombre, defecto=None):
    return args[args.index(nombre) + 1] if nombre in args and args.index(nombre) + 1 < len(args) else defecto
HOY = datetime.date.today()
# --dia AAAA-MM-DD: el día en que SALE el video (se pueden hacer con días de adelanto).
# --dia auto: el primer día desde hoy que todavía no tiene sus 3 videos.
DIA_ARG = arg('--dia')
if DIA_ARG and DIA_ARG != 'auto': HOY = datetime.date.fromisoformat(DIA_ARG)

# ── datos ─────────────────────────────────────────────────────────────────────
def leer(f):
    try: return open(os.path.join(SEC, f), encoding='utf8').read().strip()
    except OSError: return None

def panel():
    url = (leer('url.txt') or 'https://funciones-panel.vercel.app').rstrip('/')
    try:
        req = urllib.request.Request(url + '/api/resumen', headers={'Authorization': 'Bearer ' + (leer('mac.txt') or '')})
        with urllib.request.urlopen(req, timeout=60) as r: return json.load(r).get('piezas', []), None
    except Exception as e: return [], str(e)

def campos(txt):
    c = {}
    for l in txt.split('== GUION COMPLETO ==')[0].splitlines():
        m = re.match(r'^([A-ZÁÉÍÓÚÑa-záéíóúñ ()/]+):\s*(.+)$', l)
        if m and m.group(2).strip() and not m.group(2).startswith('('): c[m.group(1).strip()] = m.group(2).strip()
    return c

def balde_duracion(s):
    for o, (a, b) in zip(VARS['duracion']['opciones'], [(0, 30), (30, 40), (40, 50), (50, 60), (60, 999)]):
        if a <= s < b: return o

def franja_de(h):
    for o, (a, b) in zip(VARS['franja']['opciones'], [(0, 11), (11, 14), (14, 18), (18, 21), (21, 24)]):
        if a <= h < b: return o

def funciones():
    out = []
    for n in sorted(os.listdir(FUN)):
        if not re.match(r'^\d{3}\. ', n): continue
        d = os.path.join(FUN, n)
        try: e = json.load(open(os.path.join(d, 'etiquetas.json'), encoding='utf8'))
        except Exception: e = {}
        try: c = campos(open(os.path.join(d, 'que-se-hizo.txt'), encoding='utf8').read())
        except Exception: c = {}
        m = re.match(r'([\d.]+)', c.get('Duración (s)', ''))
        if m: e['duracion'] = balde_duracion(float(m.group(1)))          # la real manda
        m = re.match(r'(\d{4}-\d\d-\d\d) (\d\d):(\d\d)', c.get('Hora programada', ''))
        if m and not e.get('franja'): e['franja'] = franja_de(int(m.group(2)))
        dia = (m.group(1) if m else '') or e.get('dia') or c.get('Creado', '')   # el día en que sale
        out.append(dict(nombre=n, num=int(n[:3]), e=e, creado=dia, hora=m.group(0) if m else '',
                        ruta=os.path.join('2 Funciones', n, 'que-se-hizo.txt')))
    return out

# ── puntaje (el mismo que ganadores.py) ───────────────────────────────────────
def puntuar(fs, piezas):
    ahora = datetime.datetime.now(datetime.timezone.utc)
    por_nombre = {p['pieza']: p for p in piezas if p.get('fecha')}
    maduras = [p for p in por_nombre.values()
               if (ahora - datetime.datetime.fromisoformat(p['fecha'].replace('Z', '+00:00'))).total_seconds() > 48 * 3600]
    def pct(red, v):
        vals = sorted(x[red]['vistas'] for x in maduras if x.get(red) and x[red].get('vistas') is not None)
        return sum(1 for x in vals if x <= v) / len(vals) if vals else None
    for p in maduras:
        ps = [pct(r, p[r]['vistas']) for r in ('tiktok', 'instagram', 'youtube') if p.get(r) and p[r].get('vistas') is not None]
        ig = p.get('instagram') or {}
        empuje = ((ig.get('compartidos') or 0) + (ig.get('guardados') or 0)) / max(1, ig.get('vistas') or 1)
        p['puntaje'] = round((sum(ps) / len(ps) if ps else 0) + min(0.3, empuje * 10), 3)
    for f in fs:
        p = por_nombre.get(f['nombre'])
        f['madura'] = bool(p and 'puntaje' in p)
        f['puntaje'] = p.get('puntaje') if p else None
        f['vistas'] = {r: (p.get(r) or {}).get('vistas') for r in ('tiktok', 'instagram', 'youtube')} if p else {}
        f['retencion'] = p.get('retencion') if p else None
    return len(maduras)

# ── estadística por palanca ───────────────────────────────────────────────────
def estadistica(fs):
    est = {}
    for k, v in VARS.items():
        filas = []
        for o in v['opciones']:
            usan = [f for f in fs if f['e'].get(k) == o]
            mad = [f for f in usan if f['madura']]
            prom = sum(f['puntaje'] for f in mad) / len(mad) if mad else None
            filas.append(dict(op=o, n=len(usan), nm=len(mad), prom=prom,
                              tipos=len({f['e'].get('tipo') for f in mad}),
                              tt=media([f['vistas'].get('tiktok') for f in mad])))
        con = sorted([f for f in filas if f['nm'] >= 3], key=lambda f: -f['prom'])
        estado, lider, rival = 'explorando', None, None
        if len(con) >= 2 and con[0]['prom'] >= 1.2 * max(con[1]['prom'], 1e-6):
            lider, rival = con[0]['op'], con[1]['op']
            estado = 'fijo' if con[0]['nm'] >= 10 and con[0]['tipos'] >= 3 else 'va ganando'
        elif len(con) >= 2:
            rival = con[1]['op']
        # base: el líder; si no hay, el mejor con 2+ maduros; si no, lo más usado; si no, la primera opción
        if lider: base = lider
        else:
            dos = sorted([f for f in filas if f['nm'] >= 2], key=lambda f: -f['prom'])
            usadas = sorted([f for f in filas if f['n']], key=lambda f: -f['n'])
            base = (dos or usadas or filas)[0]['op']
        est[k] = dict(filas=filas, estado=estado, lider=lider, rival=rival, base=base,
                      cerca=bool(len(con) >= 2 and con[1]['prom'] >= 0.7 * con[0]['prom']))
    return est

def media(xs):
    xs = [x for x in xs if x is not None]
    return sum(xs) / len(xs) if xs else None

# ── el plan ───────────────────────────────────────────────────────────────────
def plan(fs, est, maduras, k_video):
    num = max([f['num'] for f in fs], default=0) + 1
    hoy = [f for f in fs if f['creado'] == HOY.isoformat()]
    if HOY < SEMANA_4 or maduras < 30: modo = 'explorar'
    else: modo = {0: 'nuevo', 3: 'rival', 6: 'rival'}.get(num % 10, 'ganador')
    n_pruebas = {'explorar': 3, 'nuevo': 3, 'rival': 2, 'ganador': 1}[modo]
    ya_hoy = {p for f in hoy for p in f['e'].get('pruebas', [])}
    def azar(*x): return int(hashlib.md5('|'.join(map(str, (num,) + x)).encode()).hexdigest(), 16) % 1000
    def candidatas(grupo):
        c = []
        for k, v in VARS.items():
            if v['grupo'] != grupo or k in ya_hoy: continue
            for f in est[k]['filas']:
                if f['op'] == est[k]['base']: continue
                # lo nunca probado primero, luego lo poco probado; las palancas sin decidir antes que las decididas
                c.append(((f['n'], est[k]['estado'] != 'explorando', azar(k, f['op'])), k, f['op'], 'nunca probado' if not f['n'] else f"probado {f['n']} vez/veces"))
        return sorted(c)
    pruebas = []
    if modo == 'rival':
        for k in sorted(VARS, key=lambda k: azar(k)):
            if est[k]['rival'] and est[k]['cerca'] and k not in ya_hoy and VARS[k]['grupo'] in 'ABC':
                pruebas.append((k, est[k]['rival'], 'la rival más cercana'))
            if len(pruebas) == n_pruebas: break
    grupos = ['A', 'B', 'C']
    grupos = grupos[(num + k_video) % 3:] + grupos[:(num + k_video) % 3]   # en modo ganador, el grupo rota
    for g in grupos:
        if len(pruebas) >= n_pruebas: break
        if any(VARS[p[0]]['grupo'] == g for p in pruebas): continue
        c = candidatas(g)
        if c: pruebas.append((c[0][1], c[0][2], c[0][3]))
    etiq = {k: est[k]['base'] for k, v in VARS.items() if v['grupo'] in 'ABC'}
    for k, o, _ in pruebas: etiq[k] = o
    return dict(num=num, modo=modo, pruebas=pruebas, etiquetas=etiq, hoy=hoy)

def franjas_del_dia(fs):
    """Las 3 horas de hoy: las que ya tomaron los videos de hoy + las menos usadas (sin repetir las de ayer)."""
    usos = {o: sum(1 for f in fs if f['e'].get('franja') == o) for o in VARS['franja']['opciones']}
    ayer = {f['e'].get('franja') for f in fs if f['creado'] == (HOY - datetime.timedelta(days=1)).isoformat()}
    tomadas = [f['e']['franja'] for f in fs if f['creado'] == HOY.isoformat() and f['e'].get('franja')][:3]
    libres = sorted([o for o in usos if o not in tomadas],
                    key=lambda o: (usos[o], o in ayer, (HOY.toordinal() + VARS['franja']['opciones'].index(o)) % 5))
    return tomadas + libres[:3 - len(tomadas)], usos

def temas(fs):
    def hace(t):
        fechas = [f['creado'] for f in fs if f['e'].get('tipo') == t and f['creado']]
        return max(fechas) if fechas else ''
    semana = (HOY - datetime.timedelta(days=7)).isoformat()
    return [(t, sum(1 for f in fs if f['e'].get('tipo') == t and f['creado'] >= semana), hace(t)) for t in VARS['tipo']['opciones']]

# ── informe ───────────────────────────────────────────────────────────────────
def main():
    global HOY
    fs = funciones()
    carpeta = arg('--carpeta')
    if carpeta:  # la función recién creada no cuenta: así el plan sale igual que antes de crearla
        fs = [f for f in fs if f['nombre'] != os.path.basename(os.path.normpath(carpeta))]
    # Reservas (.motor/reservas.txt: «DIA K quién fecha-hora»): un lugar de la cola tomado por una sesión que
    # todavía no crea su carpeta. Valen 3 horas; después cuenta solo la carpeta.
    RES = os.path.join(RAIZ, '.motor', 'reservas.txt')
    ahora = datetime.datetime.now()
    res = []
    try:
        for l in open(RES, encoding='utf8'):
            p_ = l.split()
            if len(p_) >= 4 and (ahora - datetime.datetime.fromisoformat(p_[3])).total_seconds() < 3 * 3600:
                res.append((p_[0], int(p_[1])))
    except OSError: pass
    def ocupados(d):
        return max([sum(1 for f in fs if f['creado'] == d)] + [k for dd, k in res if dd == d])
    if DIA_ARG == 'auto':
        while ocupados(HOY.isoformat()) >= 3: HOY += datetime.timedelta(days=1)
        if '--reservar' in args:
            k = ocupados(HOY.isoformat()) + 1
            open(RES, 'a', encoding='utf8').write(f"{HOY.isoformat()} {k} {arg('--reservar', 'sesion')} {ahora.isoformat(timespec='seconds')}\n")
            print(f'DIA={HOY.isoformat()} VIDEO={k} (reservado)')
            return
    piezas, error = panel()
    maduras = puntuar(fs, piezas)
    est = estadistica(fs)
    hoy_ya = [f for f in fs if f['creado'] == HOY.isoformat()]
    k_video = int(arg('--video', ocupados(HOY.isoformat()) + 1))
    pl = plan(fs, est, maduras, k_video)
    franjas, usos = franjas_del_dia(fs)
    dia = (HOY - INICIO).days + 1
    fase = 'EXPLORAR (semanas 1-3 o menos de 30 videos con 48 h: 3 pruebas por video)' if pl['modo'] == 'explorar' else '7 ganador · 2 rival · 1 nuevo'
    print(f'DIA={HOY.isoformat()} VIDEO={k_video}')
    o = [f'# Laboratorio · {HOY.isoformat()} · día {dia} · fase {fase}', '',
         f'{len(fs)} funciones · {maduras} con 48 h o más en el panel' + (f' · ⚠️ panel sin leer: {error}' if error else ''), '']

    o += [f'## Plan para el video {pl["num"]:03d} (video {k_video} de hoy) · modo «{pl["modo"]}»', '',
          'BASE (copiar, es lo que va ganando o lo de siempre mientras no haya datos):']
    o += ['  ' + ' · '.join(f'{k}={pl["etiquetas"][k]}' for k in pl['etiquetas'] if k not in [p[0] for p in pl['pruebas']])]
    o += ['', 'PRUEBAS (cambiar a propósito y anotarlas en «pruebas» de etiquetas.json):']
    o += [f'  - {VARS[k]["nombre"]} ({k}): {est[k]["base"]} → **{op}**  ({por})' for k, op, por in pl['pruebas']] or ['  - (ninguna: todas ya se prueban hoy; inventa una opción nueva y agrégala a variables.json)']
    if pl['modo'] == 'nuevo': o.append('  - Además: una idea que NUNCA se hizo (opción nueva en variables.json o algo de edición que no está en la lista).')
    if pl['hoy']: o.append('  Ya se prueba hoy en otros videos: ' + '; '.join(f"{f['nombre']}: {', '.join(f['e'].get('pruebas', []) or ['—'])}" for f in pl['hoy']))
    o += ['  Si la historia no deja hacer una prueba (p. ej. no hay clip para «audio real»), cámbiala por la siguiente menos probada del mismo grupo y anótalo.', '']

    o += ['## Hora de subida de hoy (3 franjas distintas, rotan para medir)']
    for i, fr in enumerate(franjas, 1):
        ya = next((f['nombre'] for f in hoy_ya if f['e'].get('franja') == fr), None)
        o.append(f'  video {i}: {fr} → cerca de las {HORA_FRANJA[fr]} (±20 min)' + (f' · ya la tomó {ya}' if ya else '  ← libre'))
    o.append('  Si una noticia es muy fresca, puede ir en la franja libre más temprana (y se anota).')
    o.append('  Usos hasta hoy: ' + ' · '.join(f'{k} {v}' for k, v in usos.items()))
    o += ['', '## Temas (los 3 del día, de 3 temas distintos; en la semana pasan todos)']
    hoy_tipos = {f['e'].get('tipo') for f in hoy_ya}
    for t, n7, ult in sorted(temas(fs), key=lambda x: (x[1], x[2])):
        o.append(f'  - {t}: {n7} en 7 días · último {ult or "nunca"}' + ('  ← ya salió HOY' if t in hoy_tipos else ''))
    falta = {k: [f['op'] for f in est[k]['filas'] if not f['n']] for k in ('epoca', 'region', 'tono')}
    o.append('  Para elegir la historia también suma lo que falta: ' + ' · '.join(f"{VARS[k]['nombre']}: {', '.join(v) or 'todo probado'}" for k, v in falta.items()))

    o += ['', '## Ganadores para abrir (lee su que-se-hizo.txt ANTES de escribir)']
    mad = sorted([f for f in fs if f['madura']], key=lambda f: -f['puntaje'])
    if not mad: o.append('  Todavía ninguno con 48 h: abre los 2 más recientes para no repetir su forma.')
    for f in mad[:3]: o.append(f"  + {f['ruta']}  · puntaje {f['puntaje']}")
    for f in mad[-2:] if len(mad) > 4 else []: o.append(f"  − {f['ruta']}  · puntaje {f['puntaje']} (evitar lo que hizo)")
    if not mad: o += [f"  · {f['ruta']}" for f in fs[-2:]]

    o += ['', '## Cada palanca (opción: videos hechos / con 48 h / puntaje medio)', '']
    for g, titulo in (('H', 'Historia'), ('A', 'Texto'), ('B', 'Edición y sonido'), ('C', 'Voz, duración, portada, publicación'), ('-', 'Hora')):
        o.append(f'### {titulo}')
        for k, v in VARS.items():
            if v['grupo'] != g: continue
            e = est[k]
            celdas = ' · '.join(f"{f['op']} {f['n']}/{f['nm']}" + (f" ({f['prom']:.2f})" if f['prom'] is not None else '') for f in e['filas'])
            marca = f"**{e['estado']}: {e['lider']}**" if e['lider'] else e['estado']
            o.append(f'- {v["nombre"]} [{marca}]: {celdas}')
        o.append('')
    texto = '\n'.join(o)
    print(texto)
    if '--guardar' in args:
        open(os.path.join(RAIZ, '3 Publicado', 'laboratorio.md'), 'w', encoding='utf8').write(texto + '\n')
        print('→ 3 Publicado/laboratorio.md')
    if carpeta:
        p = os.path.join(RAIZ, carpeta, 'etiquetas.json') if not os.path.isabs(carpeta) else os.path.join(carpeta, 'etiquetas.json')
        try: e = json.load(open(p, encoding='utf8'))
        except Exception: e = {}
        probadas = [k for k, _, _ in pl['pruebas']]
        for k, v in pl['etiquetas'].items():
            if not e.get(k) or k in probadas: e[k] = v   # lo que se prueba siempre manda
        e['modo'] = pl['modo']
        e['dia'] = HOY.isoformat()   # el día en que sale (así los videos hechos con adelanto cuentan en su día)
        e['pruebas'] = probadas
        e['franja'] = e.get('franja') or franjas[min(k_video, len(franjas)) - 1]
        e['hora_sugerida'] = HORA_FRANJA[e['franja']]
        json.dump(e, open(p, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
        print(f'→ plan escrito en {p}')

main()

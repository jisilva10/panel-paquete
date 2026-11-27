"""construir.py qwen|edge  (ejemplo: la guerra de los emús; los clips de audio salen de material/movietone.mp4, cámbialos por los de cada historia)
construir.py edge|qwen → index.html + mezcla.wav (voz, música que se aparta, efectos, audio del noticiero)."""
import json, re, subprocess, sys, unicodedata
MOTOR = sys.argv[1]
import os
# Busca la carpeta .motor subiendo desde aquí (sirve en cualquier compu y a cualquier profundidad)
_d = os.path.abspath('.')
while not os.path.isdir(os.path.join(_d, '.motor')) and _d != os.path.dirname(_d): _d = os.path.dirname(_d)
# braam.mp3 ya no existe (JIS, 26/11/2026: «suena durísimo»; salía al final de 001, 004, 005 y 006). Nada de golpes de cine fuertes al final.
S = os.path.join(_d, '.motor', 'sonidos') + os.sep; MUS = os.path.join(_d, '.motor', 'musica', 'historia.mp3')
T = json.load(open(f'tiempos-{MOTOR}.json'))
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
PAL = [(norm(w['p']), w['a']) for l in T['lineas'] for w in l['palabras']]
def W(p, k=1):
    c = 0
    for n, a in PAL:
        if n == norm(p):
            c += 1
            if c == k: return a
    raise SystemExit(f'falta {p} #{k}')
lin = lambda q: [l for l in T['lineas'] if l['quien'] == q][0]
cab = W('cabeza'); hoy = cab + 0.75
# la voz termina en «cabeza»; después, 2,8 s de la fiesta de Fruita hoy (clip real) con la música
T['dura'] = round(hoy + 0.15 + 2.8 + 0.25, 3)
# (archivo, segundo, volumen) · 14 efectos
FX = [('papel-despliega', 0.0, .6), ('pop.wav', W('animal') - .35, .5),
      ('carton-pone', W('colorado') - .05, .7), ('papel-despliega', W('granjero'), .6),
      ('whoosh-grave', W('cena') + .15, .5), ('papel-swish', W('manana') - .1, .5), ('pop.wav', W('vivo') - .15, .6),
      ('whoosh-corto', W('feria') + .05, .55), ('papel-despliega', W('feria', 2) - .05, .6), ('metal', W('ganar') + .05, .4),
      ('carton-pone', W('cuatro') - .05, .6), ('riser', W('hizo') - .9, .35), ('papel-aletea', cab - .1, .7), ('whoosh-corto', hoy - .05, .5)]
dura = T['dura']
h = open('plantilla.html', encoding='utf8').read().replace('__TIEMPOS__', json.dumps(T, ensure_ascii=False)).replace('__DURA__', str(dura))
open('index.html', 'w', encoding='utf8').write(h)
ins = ['-i', f'voz-{MOTOR}.wav', '-stream_loop', '-1', '-i', MUS]
f = ['[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[voz][llave]',
     f'[1:a]aresample=48000,atrim=12:{12+dura},asetpts=N/SR/TB,volume=0.32,afade=t=out:st={dura-2}:d=2[m0]',
     '[m0][llave]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mus]']
mix = ['[voz]', '[mus]']
# Audio original de los clips reales: (archivo, desde qué segundo del original, en qué segundo entra, cuánto dura).
# Ejemplo de los emús: el noticiero de 1932 en material/movietone.mp4. Si el archivo no está, se salta.
CLIPS_AUDIO = [('material/kkco.mp4', 21.9, hoy + .15, 2.8)]
for (arch, desde, entra, largo) in CLIPS_AUDIO:
    if not os.path.exists(arch) or largo <= 0: continue
    k = sum(1 for x in ins if x == "-i")
    ins += ['-ss', str(desde), '-t', str(round(largo, 2)), '-i', arch]
    f.append(f'[{k}:a]aresample=48000,volume=0.55,adelay={int(entra*1000)}|{int(entra*1000)},afade=t=in:st={entra}:d=0.3,afade=t=out:st={entra+largo-0.4}:d=0.4[c{k}]'); mix.append(f'[c{k}]')
for i, (n, a, v) in enumerate(FX):
    k = sum(1 for x in ins if x == '-i')
    ins += ['-i', S + (n if '.' in n else n + '.mp3')]
    f.append(f'[{k}:a]aresample=48000,volume={v},adelay={int(max(0,a)*1000)}|{int(max(0,a)*1000)}[f{i}]'); mix.append(f'[f{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0,atrim=0:{dura},loudnorm=I=-14:TP=-1.5[out]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[out]', '-ar', '48000', 'mezcla.wav'], check=True)
print('listo', MOTOR, dura, 's · cabeza', round(cab, 2), '· hoy', round(hoy, 2))

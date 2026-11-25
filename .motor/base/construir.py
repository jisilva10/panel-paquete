"""construir.py qwen|edge  (ejemplo: la guerra de los emús; los clips de audio salen de material/movietone.mp4, cámbialos por los de cada historia)
construir.py edge|qwen → index.html + mezcla.wav (voz, música que se aparta, efectos, audio del noticiero)."""
import json, re, subprocess, sys, unicodedata
MOTOR = sys.argv[1]
import os
# Busca la carpeta .motor subiendo desde aquí (sirve en cualquier compu y a cualquier profundidad)
_d = os.path.abspath('.')
while not os.path.isdir(os.path.join(_d, '.motor')) and _d != os.path.dirname(_d): _d = os.path.dirname(_d)
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
visorIn = W('filmar') + 0.15; corte = max(visorIn + 2.6, W('grupitos') - 0.9); visorOut = max(corte + 2.6, W('dias') - 0.1)
# (archivo, segundo, volumen)
FX = [('papel-despliega', 0.0, .7), ('pop.wav', W('emus') , .5), ('pop.wav', W('emus') + .3, .4), ('papel-aletea', W('comiendo') - .2, .6),
      ('whoosh-corto', W('ejercito') - .3, .6), ('carton-pone', W('mayor') - .2, .7), ('carton-pone', W('soldados') - .2, .6), ('carton-pone', W('soldados') + .1, .6),
      ('metal', W('ametralladoras') - .1, .55), ('metal', W('ametralladoras') + .15, .45), ('whoosh-corto', W('real') - .3, .5), ('papel-despliega', W('real') - .1, .7),
      ('carton-pone', W('camara') - .2, .6), ('whoosh-cine', visorIn - .1, .6), ('whoosh-corto', visorOut, .55),
      ('riser', W('apuntaron') - 1.6, .45), ('golpe-seco', W('trabo'), .8), ('metal', W('trabo') + .02, .7), ('whoosh-corto', W('vigia') - .3, .5),
      ('subdrop', W('enorme') - .2, .7), ('papel-aletea', W('rindio') - .2, .6), ('whoosh-corto', W('dijo') - .2, .4),
      ('whoosh-grave', W('hoy') + .0, .5), ('pop.wav', W('seiscientos') - .2, .5), ('pop.wav', W('seiscientos') + .2, .5), ('pop.wav', W('seiscientos') + .5, .4),
      ('golpe-grave', W('nunca') , .6)]
dura = T['dura']
h = open('plantilla.html', encoding='utf8').read().replace('__TIEMPOS__', json.dumps(T, ensure_ascii=False)).replace('__DURA__', str(dura))
open('index.html', 'w', encoding='utf8').write(h)
ins = ['-i', f'voz-{MOTOR}.wav', '-stream_loop', '-1', '-i', MUS,
       '-ss', '46', '-t', str(round(corte - visorIn, 2)), '-i', 'material/movietone.mp4',
       '-ss', '31', '-t', str(round(visorOut - corte + .4, 2)), '-i', 'material/movietone.mp4']
f = ['[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[voz][llave]',
     f'[1:a]aresample=48000,atrim=12:{12+dura},asetpts=N/SR/TB,volume=0.32,afade=t=out:st={dura-2}:d=2[m0]',
     '[m0][llave]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mus]',
     f'[2:a]aresample=48000,volume=0.55,adelay={int(visorIn*1000)}|{int(visorIn*1000)},afade=t=in:st={visorIn}:d=0.3[c1]',
     f'[3:a]aresample=48000,volume=0.55,adelay={int(corte*1000)}|{int(corte*1000)},afade=t=out:st={visorOut}:d=0.4[c2]']
mix = ['[voz]', '[mus]', '[c1]', '[c2]']
for i, (n, a, v) in enumerate(FX):
    ins += ['-i', S + (n if '.' in n else n + '.mp3')]
    f.append(f'[{4+i}:a]aresample=48000,volume={v},adelay={int(max(0,a)*1000)}|{int(max(0,a)*1000)}[f{i}]'); mix.append(f'[f{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0,atrim=0:{dura},loudnorm=I=-14:TP=-1.5[out]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[out]', '-ar', '48000', 'mezcla.wav'], check=True)
print('listo', MOTOR, dura, 's · visor', round(visorIn, 2), round(corte, 2), round(visorOut, 2))

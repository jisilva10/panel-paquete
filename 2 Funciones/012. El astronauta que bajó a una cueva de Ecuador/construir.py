"""construir.py qwen [sin-subs] → index.html + mezcla.wav (voz, música «historia» que se aparta, efectos).
012: sin audio de los clips (prueba audio_real = no). Con «sin-subs» el index.html sale sin subtítulos (para la portada)."""
import json, re, subprocess, sys, unicodedata, os
MOTOR = sys.argv[1]
SIN_SUBS = len(sys.argv) > 2 and sys.argv[2] == 'sin-subs'
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
# 14 efectos (normales 7-14). Sin braam ni golpe al final.
FX = [('papel-despliega', 0.0, .6),
      ('whoosh-grave', W('siete') - .1, .55),          # cae de la Luna a la selva
      ('papel-aletea', W('biblioteca') - .2, .55),     # la biblioteca sale brillando de la boca
      ('carton-pone', W('mil') - .1, .65),              # el cartel
      ('papel-aletea', W('pajaros') - .2, .6),          # los tayos salen del pozo
      ('pop.wav', W('explorador') - .1, .5),
      ('whoosh-corto', W('extraterrestres') - .2, .5),  # el platillo sale del libro
      ('carton-pone', W('ecuador', 2) - .15, .6),       # banderas
      ('whoosh-cine', W('helicopteros') - .3, .55),     # el helicóptero
      ('whoosh-cine', W('bajo', 2) + .05, .6),          # se mete por la boca de la cueva (clip del pozo)
      ('golpe-seco', W('no') - .02, .7),                 # la biblioteca se deshace
      ('pop.wav', W('tarantulas') - .05, .55),
      ('whoosh-corto', W('eso') + .05, .5),             # sube a la superficie
      ('papel-swish', W('resbalo') - .05, .7)]          # el resbalón
dura = T['dura']
h = open('plantilla.html', encoding='utf8').read().replace('__TIEMPOS__', json.dumps(T, ensure_ascii=False)).replace('__DURA__', str(dura)).replace('__SINSUBS__', 'true' if SIN_SUBS else 'false')
open('index.html', 'w', encoding='utf8').write(h)
if SIN_SUBS: print('index.html sin subtítulos'); sys.exit(0)
ins = ['-i', f'voz-{MOTOR}.wav', '-stream_loop', '-1', '-i', MUS]
f = ['[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,asplit=2[voz][llave]',
     f'[1:a]aresample=48000,atrim=12:{12+dura},asetpts=N/SR/TB,volume=0.32,afade=t=out:st={dura-2}:d=2[m0]',
     '[m0][llave]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[mus]']
mix = ['[voz]', '[mus]']
for i, (n, a, v) in enumerate(FX):
    k = sum(1 for x in ins if x == '-i')
    ins += ['-i', S + (n if '.' in n else n + '.mp3')]
    f.append(f'[{k}:a]aresample=48000,volume={v},adelay={int(max(0,a)*1000)}|{int(max(0,a)*1000)}[f{i}]'); mix.append(f'[f{i}]')
f.append(''.join(mix) + f'amix=inputs={len(mix)}:normalize=0,atrim=0:{dura},loudnorm=I=-14:TP=-1.5[out]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', '[out]', '-ar', '48000', 'mezcla.wav'], check=True)
print('listo', MOTOR, dura, 's · efectos', len(FX))

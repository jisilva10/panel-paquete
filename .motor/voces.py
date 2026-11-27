"""Voces que actúan. guion.txt → voz.wav + tiempos.json
Uso: voces2.py CARPETA edge|qwen
Marcas del guion: QUIEN [emoción]: texto · «...» pausa larga · *palabra* con fuerza
- edge: la línea se parte en trozos; cada trozo con su velocidad/tono/volumen según la emoción, las pausas
  se ponen a mano y la palabra con fuerza va más lenta y más alta.
- qwen: una voz diseñada (siempre la misma descripción) + la emoción de la línea; local y gratis.
Los tiempos de cada palabra salen de Whisper y se asignan contando las palabras del guion."""
import asyncio, json, os, re, subprocess, sys, wave
import numpy as np

SR, FPS = 24000, 30
CARPETA, MOTOR = sys.argv[1], sys.argv[2]
# Ritmo (JIS, 25/11/2026: «pausas dramáticas sí, pero no tan largas: se siente lento»). Se juega y se mide:
# va en etiquetas.json → "ritmo". Uso: voces.py CARPETA qwen [rapido|medio|dramatico] [velocidad]  (por defecto rapido)
# La velocidad (1.00 | 1.07 | 1.12 | 1.17) también se prueba (etiquetas.json → "velocidad"); si no se da, la del ritmo.
RITMOS = {
  'rapido':    dict(silencio=0.28, entre=(0.26, 0.12), tempo=1.07, instr='Ritmo ágil y con energía, como un buen narrador de videos cortos: en los puntos suspensivos haz solo una pausa corta, nunca larga.'),
  'medio':     dict(silencio=0.40, entre=(0.36, 0.18), tempo=1.0,  instr='Haz una pausa breve en los puntos suspensivos.'),
  'dramatico': dict(silencio=0.65, entre=(0.45, 0.22), tempo=1.0,  instr='Respeta las pausas de los puntos suspensivos.'),
}
RITMO = sys.argv[3] if len(sys.argv) > 3 else 'rapido'
R = dict(RITMOS[RITMO])
if len(sys.argv) > 4: R['tempo'] = float(sys.argv[4])

# emoción → (velocidad, tono, volumen) en Edge, y frase para Qwen
EMO = {
  'misterio':     ('-6%',  '-6Hz', '+0%',  'en voz baja y misteriosa, como quien cuenta un secreto increíble, con pausas cortas'),
  'indignado':    ('+6%',  '+4Hz', '+8%',  'indignado y rápido, con fuerza'),
  'solemne':      ('-4%',  '-8Hz', '+4%',  'solemne y exagerado, como anunciando algo épico, con ironía'),
  'confidencial': ('+2%',  '+0Hz', '-6%',  'en tono confidencial y cómplice, casi susurrando, sorprendido'),
  'burla':        ('+4%',  '+6Hz', '+0%',  'aguantándose la risa, burlón'),
  'tension':      ('+0%',  '-2Hz', '+6%',  'con tensión creciente, como narrando una película de suspenso'),
  'asombro':      ('-2%',  '+8Hz', '+6%',  'asombrado de verdad, sin poder creerlo'),
  'resignado':    ('-6%',  '-6Hz', '-4%',  'resignado, con un suspiro, lento'),
  'cierre':       ('-8%',  '-8Hz', '+0%',  'lento y contundente, dejando la última frase en el aire, con una sonrisa'),
  'alarma':       ('+16%', '+30Hz','+10%', 'alarmado, gritando un aviso'),
  'admiracion':   ('-4%',  '-10Hz','+4%',  'militar viejo, admirado a su pesar, con voz ronca'),
  'tierno':       ('-2%',  '+2Hz', '+0%',  'con ternura y cariño, como contando algo lindo, sin perder el ritmo'),
  'triste':       ('-6%',  '-6Hz', '-4%',  'triste y serio, con respeto, sin exagerar ni dramatizar'),
  'conmovido':    ('-8%',  '-8Hz', '-2%',  'conmovido, con la voz un poco quebrada pero firme, despacio'),
}
VOZ_EDGE = {'NARRADOR': ('es-EC-LuisNeural', '+4%', '-4Hz'), 'MAYOR': ('es-AR-TomasNeural', '+0%', '-14Hz'), 'EMU': ('es-MX-DaliaNeural', '+8%', '+22Hz')}
VOZ_QWEN = {
  'NARRADOR': 'Narrador latinoamericano de unos cuarenta años, voz cálida y grave, cuenta historias reales increíbles como un buen contador de anécdotas',
  'MAYOR': 'Militar australiano de sesenta años hablando español con acento, voz ronca y grave',
  'EMU': 'Voz aguda y nasal de un ave caricaturesca, rápida',
  'REHEN': 'Hombre joven colombiano de Medellín, de unos veinticinco años, voz nerviosa y agotada después de muchas horas de miedo',
  'PIERNA': 'Voz caricaturesca de un objeto que habla: un viejo soldado de papel, voz grave y teatral, muy digna y orgullosa',
  'DIRECTOR': 'Hombre de unos sesenta años, director de un zoológico, voz grave, cálida y cansada, de alguien que acaba de perder a un animal muy querido',
}
PAUSA = {'...': R['silencio'], ',': 0.10, '.': 0.24, ':': 0.24, '?': 0.24, '!': 0.22}

def leer():
    out = []
    for l in open(os.path.join(CARPETA, 'guion.txt'), encoding='utf8'):
        m = re.match(r'^([A-ZÁÉÍÓÚÑ]+)\s*(?:\[([^\]]+)\])?:\s*(.+)$', l.strip())
        if m and not l.startswith('#'):
            out.append(dict(quien=m[1], emo=(m[2] or 'cierre').replace('ó','o').replace('ñ','n'), texto=m[3]))
    return out

def a_wav(src, dst):
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',src,'-ac','1','-ar',str(SR),dst], check=True)
def leer_wav(p):
    with wave.open(p) as w: return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32)/32768
def recorta(x):
    on = np.where(np.abs(x) > 0.012)[0]
    return x if not len(on) else x[max(0, on[0]-int(.02*SR)): on[-1]+int(.06*SR)]

def edge_linea(L, i):
    import edge_tts
    voz, r0, p0 = VOZ_EDGE[L['quien']]; r, p, v = EMO[L['emo']][:3]
    suma = lambda a, b, u: f"{int(a[:-len(u)])+int(b[:-len(u)]):+d}{u}"
    # trozos: corta en «...», «,», «:», «.» y alrededor de *palabras con fuerza*
    trozos = [t for t in re.split(r'(\.\.\.|[,:.?!¿¡]|\*[^*]+\*)', L['texto']) if t and t.strip()]
    partes = []
    for t in trozos:
        if t in PAUSA: partes.append(np.zeros(int(PAUSA[t]*SR), np.float32)); continue
        fuerte = t.startswith('*')
        txt = t.strip('* ')
        if not re.search(r'\w', txt): continue
        rate = suma(suma(r0, r, '%'), '-10%' if fuerte else '+0%', '%')
        pitch = suma(suma(p0, p, 'Hz'), '+6Hz' if fuerte else '+0Hz', 'Hz')
        vol = suma(v, '+15%' if fuerte else '+0%', '%')
        ruta = os.path.join(CARPETA, '.voz', f'{i:02d}-{len(partes)}')
        async def uno():
            await edge_tts.Communicate(txt, voz, rate=rate, pitch=pitch, volume=vol).save(ruta + '.mp3')
        asyncio.run(uno()); a_wav(ruta + '.mp3', ruta + '.wav')
        x = recorta(leer_wav(ruta + '.wav')) * (1.0 if fuerte else 0.92)
        partes.append(x); partes.append(np.zeros(int(0.03*SR), np.float32))
    return np.concatenate(partes)

def en_palabras(t):
    """La voz lee los números en palabras (en cifras, Qwen los decía con acento inglés). El subtítulo sigue con cifras."""
    from num2words import num2words
    return re.sub(r'\d+(?:\.\d{3})*', lambda m: num2words(int(m.group(0).replace('.', '')), lang='es'), t)

ACENTO = ' Habla en español latinoamericano neutro, con pronunciación nativa (nada de acento inglés).'

MODELO = None
_CANDADO = None

def _tarjeta_usada_mib():
    try:
        r = subprocess.run(['nvidia-smi', '--query-gpu=memory.used', '--format=csv,noheader,nounits'], capture_output=True, text=True, timeout=20)
        return int(r.stdout.split()[0])
    except Exception:
        return 0

def esperar_tarjeta(max_min=60):
    """La tarjeta (6 GB) aguanta UNA voz Qwen a la vez. Si otra sesión la está usando, espera.
    Toma el candado .motor/.tarjeta.lock (se suelta solo al terminar el proceso) y además mira que la memoria esté libre."""
    global _CANDADO
    try:
        import msvcrt
    except ImportError:
        return  # no es Windows
    import time
    f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.tarjeta.lock'), 'a+')
    t0, avisado = time.time(), False
    while True:
        try:
            f.seek(0); msvcrt.locking(f.fileno(), msvcrt.LK_NBLCK, 1)
            if _tarjeta_usada_mib() < 2500:
                _CANDADO = f
                return
            f.seek(0); msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
        except OSError:
            pass
        if not avisado:
            print('· la tarjeta está ocupada por otra voz: espero a que se libere...', flush=True); avisado = True
        if time.time() - t0 > max_min * 60:
            sys.exit(f'la tarjeta siguió ocupada {max_min} min: prueba más tarde')
        time.sleep(20)

def qwen_linea(L, i):
    """Qwen3-TTS con voz diseñada. Mac con chip Apple: mlx-audio. Windows/Linux con NVIDIA: el paquete oficial qwen-tts (PyTorch/CUDA)."""
    global MODELO
    texto = en_palabras(L['texto'].replace('*', ''))
    fuertes = re.findall(r'\*([^*]+)\*', L['texto'])
    instr = VOZ_QWEN[L['quien']] + '.' + ACENTO + ' Habla ' + EMO[L['emo']][3] + '.' + (f' Pone mucha fuerza en «{", ".join(fuertes)}».' if fuertes else '') + ' ' + R['instr']
    try:
        import mlx.core as mx  # Mac con chip Apple
        if MODELO is None:
            from mlx_audio.tts.utils import load_model
            MODELO = ('mlx', load_model('mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-5bit'))
        mx.random.seed(7 + i)
        trozos = [np.array(r.audio, dtype=np.float32) for r in MODELO[1].generate(text=texto, instruct=instr, lang_code='spanish', temperature=0.8)]
        return recorta(np.concatenate(trozos))
    except ImportError:
        pass
    # Windows / Linux con GPU NVIDIA: pip install qwen-tts torch (con CUDA). Si la API cambió, adaptar solo esta parte.
    import torch
    from qwen_tts import Qwen3TTSModel
    if MODELO is None:
        esperar_tarjeta()
        MODELO = ('torch', Qwen3TTSModel.from_pretrained('Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign', device_map='cuda:0', dtype=torch.bfloat16))
    torch.manual_seed(7 + i)
    wavs, sr = MODELO[1].generate_voice_design(text=texto, language='Spanish', instruct=instr)
    x = np.asarray(wavs[0], dtype=np.float32)
    if sr != SR:  # todo el motor trabaja a 24 kHz
        x = np.interp(np.linspace(0, len(x) - 1, int(len(x) * SR / sr)), np.arange(len(x)), x).astype(np.float32)
    return recorta(x)

def acorta_silencios(x, maximo):
    """Ningún silencio dentro de una línea dura más de `maximo` segundos (Qwen a veces se queda callado mucho en los «...»)."""
    hop = int(0.01 * SR); n = len(x) // hop
    if n < 3: return x
    rms = np.sqrt(np.mean(x[:n * hop].reshape(n, hop) ** 2, axis=1))
    callado = rms < max(0.004, 0.08 * np.percentile(rms, 95))
    partes, i = [], 0
    while i < n:
        j = i
        while j < n and callado[j] == callado[i]: j += 1
        seg = x[i * hop:j * hop]
        if callado[i] and len(seg) > maximo * SR:
            k = int(maximo * SR) // 2
            seg = np.concatenate([seg[:k], seg[-k:]])
        partes.append(seg); i = j
    partes.append(x[n * hop:])
    return np.concatenate(partes)

def acelera(x, factor):
    """Más rápido sin cambiar el tono (ffmpeg atempo)."""
    if abs(factor - 1) < 0.005: return x
    tmp = os.path.join(CARPETA, '.voz', 'tempo')
    escribir(tmp + '-a.wav', x)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp + '-a.wav', '-filter:a', f'atempo={factor}', '-ar', str(SR), tmp + '-b.wav'], check=True)
    return leer_wav(tmp + '-b.wav')

def tiempos_palabras(y, lineas):
    """Whisper da los tiempos; las palabras del guion se reparten contando, línea por línea."""
    tmp = os.path.join(CARPETA, '.voz', 'todo.wav'); escribir(tmp, y)
    try:  # Mac con chip Apple
        import mlx_whisper
        r = mlx_whisper.transcribe(tmp, path_or_hf_repo="mlx-community/whisper-small-mlx", language="es", word_timestamps=True)
        W = [[w["start"], w["end"], w["word"]] for seg in r["segments"] for w in seg["words"]]
    except ImportError:  # Windows / Linux: pip install faster-whisper. En la PC, siempre en el procesador
        from faster_whisper import WhisperModel  # (en la tarjeta falta cublas64_12.dll y da tiempos malos)
        segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(tmp, language="es", word_timestamps=True)
        W = [[w.start, w.end, w.word] for seg in segs for w in seg.words]
    def peso(t):  # cuánto «dura» una palabra: sus letras; cada cifra se lee como una palabra larga
        t = re.sub(r'[^\wáéíóúñü]', '', t.lower())
        return max(1, sum(5 if c.isdigit() else 1 for c in t))
    for L in lineas:
        tok = L['texto'].replace('*', '').split()
        dentro = [w for w in W if w[0] >= L['ini'] - 0.15 and w[1] <= L['fin'] + 0.15] or [[L['ini'], L['fin'], L['texto']]]
        # Reparto por letras (27/11/2026): Whisper casi nunca oye el mismo número de palabras que el guion
        # (números, palabras pegadas), así que se mapea la posición en letras del guion al tiempo de lo que oyó.
        tramos, c = [], 0.0
        for w in dentro:
            n = peso(w[2]); tramos.append((c, c + n, w[0], w[1])); c += n
        total_w = c
        pesos = [peso(t) for t in tok]; total_g = sum(pesos) or 1
        def tiempo(x, inicio):
            x *= total_w
            for c0, c1, t0, t1 in tramos:
                if x < c1 or (x == c1 and not inicio):
                    if x < c0: return t0
                    return t0 + (t1 - t0) * (x - c0) / max(1e-9, c1 - c0)
            return tramos[-1][3]
        L['palabras'] = []
        acc = 0
        for t, n in zip(tok, pesos):
            a = tiempo(acc / total_g, True); acc += n
            f = tiempo(acc / total_g, False)
            L['palabras'].append(dict(p=t, a=round(a, 3), f=round(max(f, a + 0.05), 3)))

def escribir(p, y):
    with wave.open(p, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1)*32767).astype(np.int16).tobytes())

def main():
    os.makedirs(os.path.join(CARPETA, '.voz'), exist_ok=True)
    lineas, pista, t = leer(), [], 0.0
    for i, L in enumerate(lineas):
        x = edge_linea(L, i) if MOTOR == 'edge' else qwen_linea(L, i)
        x = acelera(acorta_silencios(x, R['silencio']), R['tempo'])
        x = x / max(1e-6, np.sqrt(np.mean(x[np.abs(x) > 0.01]**2))) * 0.12  # cada línea al mismo nivel
        gap = R['entre'][0] if L['emo'] in ('misterio', 'cierre', 'resignado') else R['entre'][1]
        L.update(ini=round(t, 3), fin=round(t + len(x)/SR, 3))
        pista += [x, np.zeros(int(gap*SR), np.float32)]; t += len(x)/SR + gap
        print(f'· {i+1}/{len(lineas)} {L["quien"]} [{L["emo"]}] {len(x)/SR:.1f}s', flush=True)
    y = np.concatenate(pista); y = y / max(1e-6, np.abs(y).max()) * 0.89
    escribir(os.path.join(CARPETA, f'voz-{MOTOR}.wav'), y)
    tiempos_palabras(y, lineas)
    hop = SR // FPS; n = int(len(y)/SR*FPS)+1
    rms = np.array([np.sqrt(np.mean(y[i*hop:(i+1)*hop]**2)) if i*hop < len(y) else 0 for i in range(n)])
    boca = np.clip(rms / np.percentile(rms[rms > 0.01], 90), 0, 1)
    json.dump(dict(fps=FPS, ritmo=RITMO, velocidad=R['tempo'], dura=round(len(y)/SR + 1.2, 3), lineas=lineas, boca=[round(float(v), 2) for v in boca]),
              open(os.path.join(CARPETA, f'tiempos-{MOTOR}.json'), 'w'), ensure_ascii=False)
    print('listo', MOTOR, RITMO, R['tempo'], round(len(y)/SR, 1), 's')
main()

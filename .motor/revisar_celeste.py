"""¿Hay cuadros vacíos (el fondo celeste de la plantilla) en el video? Revisa CADA cuadro, no uno por segundo.
Uso: python .motor/revisar_celeste.py "2 Funciones/NNN. Título/salida/video.mp4"
Si sale alguno, el timeline se registró antes de que cargara todo (ver el final de .motor/base/plantilla.html)."""
import subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')
import numpy as np
v = sys.argv[1]
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', v, '-vf', 'scale=16:16', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, 16, 16, 3).astype(float)
plano = f.std(axis=(1, 2)).mean(axis=1) < 6          # un solo color en todo el cuadro
celeste = np.abs(f - np.array([0x8c, 0xc6, 0xe8])).mean(axis=(1, 2, 3)) < 12
mal = [i for i in range(len(f)) if plano[i] and celeste[i]]
print(f'{len(f)} cuadros revisados · vacíos: {len(mal)}' + (' → ' + ', '.join(f'{i / 30:.2f}s' for i in mal) if mal else ' · todo bien'))
sys.exit(1 if mal else 0)

"""¿Le falta algo a esta compu para hacer videos de es_enserio.tv? Corre: python .motor/revisar.py
Revisa programas, librerías de voz, Hyperframes, la plantilla, las llaves del panel y GitHub. Sale con código 1 si falta algo."""
import importlib, os, platform, shutil, subprocess, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WIN = platform.system() == 'Windows'
faltas, bien = [], []

def ok(cond, que, como=''):
    (bien if cond else faltas).append(que if cond else f'{que} → {como}')

def corre(cmd):
    try: return subprocess.run(cmd, capture_output=True, text=True, timeout=180, shell=WIN).returncode == 0
    except Exception: return False

ok(platform.system() == 'Windows', 'Sistema Windows (la rutina solo corre aquí)', f'esta compu es {platform.system()}: aquí no se produce')
for prog, como in [('git', 'winget install Git.Git'), ('node', 'winget install OpenJS.NodeJS.LTS'), ('npx', 'viene con Node'),
                   ('ffmpeg', 'winget install Gyan.FFmpeg'), ('ffprobe', 'viene con ffmpeg'), ('yt-dlp', 'winget install yt-dlp.yt-dlp')]:
    ok(shutil.which(prog) is not None, prog, como)
mods = ['edge_tts', 'num2words', 'PIL', 'numpy'] + (['faster_whisper', 'qwen_tts', 'torch'] if WIN else ['mlx_whisper', 'mlx_audio'])
for m in mods:
    try: importlib.import_module(m); ok(True, f'python: {m}')
    except Exception: ok(False, f'python: {m}', f'pip install -r .motor/requisitos-{"windows" if WIN else "mac"}.txt (en el venv)')
if WIN:
    try:
        import torch; ok(torch.cuda.is_available(), 'Tarjeta NVIDIA con CUDA (voz Qwen rápida)', 'sin GPU: Qwen será muy lento; avisar a JIS y usar voces.py . edge')
    except Exception: pass
for f in ['base/plantilla.html', 'base/construir.py', 'base/hyperframes.json', 'base/vendor/gsap.min.js', 'fuentes/BagelFatOne-Regular.ttf',
          'fuentes/LilitaOne-Regular.ttf', 'musica/historia.mp3', 'sonidos/pop.wav', 'plantillas/que-se-hizo.txt', 'voces.py', 'portada.py',
          'nueva_funcion.py', 'ganadores.py', 'limpiar.py', 'RECETA.md']:
    ok(os.path.exists(os.path.join(RAIZ, '.motor', f)), f'.motor/{f}', 'falta en la carpeta: git pull')
ok(os.path.isdir(os.path.join(RAIZ, '.claude', 'skills', 'hyperframes-core')), 'Guías de Hyperframes (.claude/skills)', 'git pull')
ok(corre(['npx', '--yes', 'hyperframes@0.8.33', '--version']), 'Hyperframes 0.8.33', 'npx --yes hyperframes@0.8.33 --version (necesita Chrome)')
ok(os.path.isdir(os.path.join(RAIZ, 'panel', 'node_modules')), 'panel: npm install', 'cd panel && npm install')
ok(os.path.exists(os.path.join(RAIZ, 'panel', '.env.local')), 'panel: .env.local (token de videos)', 'npx vercel env pull .env.local --environment production')
ok(os.path.exists(os.path.join(RAIZ, 'panel', '.secretos', 'mac.txt')), 'panel: llave de esta compu', 'ver MUDANZA.md paso 3')
ok(corre(['git', '-C', RAIZ, 'ls-remote', '--exit-code', 'origin', 'main']), 'GitHub accesible (pull/push)', 'gh auth login --web')

print('✓ ' + '\n✓ '.join(bien))
if faltas: print('\n✗ FALTA:\n✗ ' + '\n✗ '.join(faltas)); sys.exit(1)
print('\nTodo listo para hacer videos.')

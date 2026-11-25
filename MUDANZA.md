# Mudanza a otra compu

Esto lo hace **Claude en la compu nueva**, solo. JIS solo abre Claude ahí y le pega el link del repositorio.

## Lo que JIS hace (una vez)
1. En la compu nueva: instalar **Claude** (app de escritorio), **Google Chrome** con la extensión **Claude in Chrome**, y entrar con su cuenta.
2. En ese Chrome, iniciar sesión en Instagram, TikTok y YouTube con **es_enserio.tv**, y en **vercel.com** y **github.com** con sus cuentas.
3. Abrir Claude en la pestaña Code y escribir:
   «Clona https://github.com/jisilva10/panel-paquete en el Escritorio como carpeta "Titeres" y sigue MUDANZA.md».

## Lo que Claude hace (la compu nueva es **Windows**)
0. **Antes de nada, mira la tarjeta de video**: `nvidia-smi`. Si hay una NVIDIA con 8 GB o más, la voz Qwen va bien. Si no hay, díselo a JIS: la voz Qwen en solo procesador es muy lenta (minutos por frase) y mientras tanto se usa `voces.py . edge`.
1. **Programas** con `winget`: `Git.Git`, `OpenJS.NodeJS.LTS`, `Python.Python.3.12`, `Gyan.FFmpeg`, `GitHub.cli`, `yt-dlp.yt-dlp`, `Google.Chrome` (si no está). Cierra y abre la terminal para que tome el PATH. Comprueba `node -v`, `python --version`, `ffmpeg -version`.
1b. **GitHub**: `gh auth login --web` (JIS aprueba en el navegador) y en la carpeta: `git config user.name jisilva10` y `git config user.email jisilva10@users.noreply.github.com`. Prueba `git pull` y un `git push` vacío: la rutina empuja sus textos cada noche.
1c. **Guías de Hyperframes**: ya vienen en `.claude/skills/` de la carpeta (hyperframes, core, cli, audio, animation, keyframes); Claude las usa al abrir esta carpeta.
2. **Panel**: `cd panel`, `npm install`, `npx vercel login` (JIS aprueba en el navegador), `npx vercel link --yes --project funciones-panel`, `npx vercel env pull .env.local --environment production`.
3. **Llave de esta compu**: genera una nueva (`node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`), guárdala en `panel/.secretos/mac.txt`, escribe `https://funciones-panel.vercel.app` en `panel/.secretos/url.txt`, reemplaza `PANEL_TOKEN_MAC` en Vercel (`npx vercel env rm PANEL_TOKEN_MAC production --yes` y `npx vercel env add PANEL_TOKEN_MAC production`), publica (`npx vercel deploy --prod --yes`) y comprueba con `npm run estado`. Así la llave vieja de la Mac deja de servir: solo la PC puede programar.
4. **Voz** (`.motor/`): `python -m venv venv`, `venv\Scripts\pip install -r requisitos-windows.txt` y PyTorch con CUDA (`venv\Scripts\pip install torch --index-url https://download.pytorch.org/whl/cu124`). `voces.py` elige solo: en Windows usa `qwen-tts` (modelo `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign`) y `faster-whisper`. Prueba con `.motor\base`: `..\venv\Scripts\python ..\voces.py . qwen` y escucha `voz-qwen.wav`. Si la API de `qwen-tts` cambió, ajusta solo la parte de Windows de `qwen_linea`.
5. **Video**: `npx --yes hyperframes@0.8.33 --version` (usa Chrome). En `.motor\base`: `python construir.py qwen` y `npx --yes hyperframes@0.8.33 render -o salida\prueba.mp4`. Mira fotogramas.
6. **La rutina**: crea UNA tarea programada «es_enserio: rutina de las 3», todos los días a las 3:00 (cron `0 3 * * *`), con el texto de `.motor/tarea-programada.md` (cambia `<proyecto>` por la ruta real). La de la Mac ya está apagada.
7. **Que no se duerma**: Configuración → Sistema → Energía → Pantalla y suspensión → «Nunca» con corriente. Que Claude abra al iniciar sesión.
7b. **Chequeo**: `venv\Scripts\python .motor\revisar.py` tiene que terminar en «Todo listo para hacer videos». Si dice FALTA, arregla eso primero.
8. **Prueba de punta a punta**: una función con `.motor/RECETA.md`, programada primero con `--probar`.

(En una Mac con chip Apple sería: `brew install node python ffmpeg espeak-ng gh` y `pip install edge-tts mlx-audio misaki espeakng-loader phonemizer-fork num2words pillow numpy mlx-whisper`; `voces.py` usa mlx solo.)

## Lo que NO viaja por GitHub (a propósito)
- Llaves y claves: están en Vercel. `panel/.secretos/` se crea de nuevo.
- `venv/`, `node_modules/`, modelos de voz: se instalan de nuevo (~4 GB de descarga).
- Videos ya hechos y el laboratorio de pruebas.

# Mudanza a otra compu

Esto lo hace **Claude en la compu nueva**, solo. JIS solo abre Claude ahí y le pega el link del repositorio.

## Lo que JIS hace (una vez)
1. En la compu nueva: instalar **Claude** (app de escritorio), **Google Chrome** con la extensión **Claude in Chrome**, y entrar con su cuenta.
2. En ese Chrome, iniciar sesión en Instagram, TikTok y YouTube con **es_enserio.tv**, y en **vercel.com** y **github.com** con sus cuentas.
3. Abrir Claude en la pestaña Code y escribir:
   «Clona https://github.com/<su-usuario>/es-enserio en el Escritorio como carpeta "Titeres" y sigue MUDANZA.md».

## Lo que Claude hace
1. **Programas**: Node 22, Python 3.11+, ffmpeg y git. En Mac con `brew`; en Windows con `winget` (OpenJS.NodeJS.LTS, Python.Python.3.12, Gyan.FFmpeg, Git.Git).
2. **Panel**: `cd panel && npm install`, `npx vercel login` (JIS aprueba en el navegador), `npx vercel link --project funciones-panel`, `npx vercel env pull .env.local --environment production` (baja el token de los videos).
3. **Llave de esta compu**: crear una nueva, guardarla en `panel/.secretos/mac.txt` y `panel/.secretos/url.txt` (`https://funciones-panel.vercel.app`), reemplazar `PANEL_TOKEN_MAC` en Vercel con ella y volver a publicar (`npx vercel deploy --prod --yes`). Comprobar con `npm run estado`.
4. **Voz** (`.motor/`): crear `venv` y, según la máquina:
   - **Mac con chip Apple (M1-M4)**: `pip install edge-tts mlx-audio misaki espeakng-loader phonemizer-fork num2words pillow numpy` + `brew install espeak-ng`. `voces.py` funciona tal cual (modelo `mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-5bit`).
   - **Windows o Linux con tarjeta NVIDIA**: usar Qwen3-TTS oficial con PyTorch/CUDA (modelo `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign`) y adaptar la función `qwen_linea` de `voces.py` (misma descripción de voz e instrucción de emoción).
   - **Sin GPU**: Qwen va muy lento; avisar a JIS y, mientras, usar el motor `edge` de `voces.py`.
   - Whisper (tiempos de palabras): en Mac `mlx-whisper`; en otro equipo `faster-whisper` (adaptar `tiempos_palabras`).
5. **Video**: `npx --yes hyperframes@0.8.33 --version` (necesita Chrome). Probar con `.motor/base`: `python construir.py qwen` y un render corto.
6. **Disparador**: crear la tarea programada «es_enserio: una función» (cada 3 horas) con el texto de `.motor/tarea-programada.md`. Desactivar la de la Mac vieja (decírselo a JIS).
7. **Probar de punta a punta**: armar una función con `.motor/RECETA.md` y programarla con `--probar` primero.
8. Si la compu va a estar **siempre prendida**: que no se duerma (en Mac, Ajustes → Batería; en Windows, Energía → Nunca) y que Claude abra al iniciar sesión.

## Lo que NO viaja por GitHub (a propósito)
- Llaves y claves: están en Vercel. `panel/.secretos/` se crea de nuevo.
- `venv/`, `node_modules/`, modelos de voz: se instalan de nuevo (~4 GB de descarga).
- Videos ya hechos y el laboratorio de pruebas.

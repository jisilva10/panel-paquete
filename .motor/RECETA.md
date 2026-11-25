# Receta: una función de es_enserio.tv, de punta a punta

La sigue el disparador (tarea programada «es_enserio: una función»). Una función por corrida.

## 0. ¿Hace falta?
**Solo se produce en la PC con Windows.** Si esta compu es una Mac (macOS), PARA: no armes nada, no programes nada y termina con una línea que lo diga.
`cd panel && npm run estado` (desde la carpeta del proyecto) → si Instagram o TikTok no están conectados, PARA y anótalo.
`npm run cola` → si ya hay **6 o más** funciones programadas a futuro, PARA (el colchón alcanza). Si no, sigue.

## 1. La historia
- Lee `CLAUDE.md` y `1 Historias/banco.md`.
- Primero lo que es tendencia hoy (busca en la web: lo más comentado, noticias raras, Latinoamérica). Si no, del banco.
- Dos fuentes. La gente real solo dice lo que dijo. Nada sexual ni religioso. Política y crimen sí, sin difamar. Nada de «moraleja»: cierre con frase wow (dato que remata, ironía, vuelta al gancho, frase del protagonista, pregunta) — rota el estilo.
- Mira en el panel («Qué está ganando») qué tipo, duración, gancho y cierre van mejor: 7 de cada 10 con lo que gana, 2 con el rival, 1 algo nuevo.

## 2. La carpeta
`2 Funciones/AAAA-MM-DD/NN-slug/` copiando de `.motor/base/`: `plantilla.html construir.py hyperframes.json vendor/ fuentes/` (los `fotos/`, `clips/` y `guion.txt` de ahí son el ejemplo de los emús).
- `guion.txt`: `QUIEN [emoción]: texto` · «...» pausa · `*palabra*` fuerza. Fuentes arriba con `#`.
- `etiquetas.json`: `{"tipo":…, "duracion":"20-30 s|35-45 s|55-70 s", "gancho":…, "cierre":…, "voz":"qwen", "edicion":…}`.

## 3. Lo real
Fotos y clips de donde estén (YouTube con `yt-dlp`, la noticia, Wikimedia), **2-4 s**, siempre con la fuente chiquita abajo y nada más de texto. Clips a fotogramas (`ffmpeg … fps=30`).

## 4. Voz
`<proyecto>\.motor\venv\Scripts\python <proyecto>\.motor\voces.py . qwen` (≈6 min por minuto de voz; los números se leen en palabras).

## 5. La película
Reescribe en `plantilla.html` las funciones de la escena (las de los emús son el ejemplo): un mundo de papel continuo, la cámara entra a cada lugar, personajes reales dibujados parecidos (y su foto si es histórico), boca con la voz, nada delante que estorbe (sin trigo/paja delante), nada amontonado. Cada cosa se ata a una PALABRA con `W("palabra", n)`. Ajusta los efectos de `construir.py`.
`python3 construir.py qwen && npx --yes hyperframes@0.8.33 render -o salida/video.mp4`. Saca fotogramas de los momentos clave y míralos ANTES de seguir; arregla lo que se vea mal.

## 6. Portada y texto
`<proyecto>\.motor\venv\Scripts\python <proyecto>\.motor\portada.py escena.png "ARRIBA" "ABAJO" portada.jpg limpio.png` (escena sin subtítulo, titular bajo las caras, sin número).
`texto.txt`: 1-2 frases que den ganas (≤125 caracteres), una línea «Fuentes: …», y 5 hashtags.

## 7. Programar
Hora: la siguiente franja libre de 11:30, 15:00, 19:30 o 21:30 (hora de Ecuador), variando ±20 min; nunca de madrugada.
`cd <proyecto>\panel && npm run programar -- --video <mp4> --portada <jpg> --etiquetas <json> --pieza "NN. Título" --hora "AAAA-MM-DD HH:MM" --texto-archivo <txt>` (primero con `--probar`).

## 8. Limpiar
Borra de la carpeta la voz suelta, los fotogramas y `material/`. Deja guion, etiquetas, texto, portada y el MP4 hasta 7 días después de publicado.

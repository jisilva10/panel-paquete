# La rutina de las 3 a. m. · es_enserio.tv

La corre la tarea programada **«es_enserio: rutina de las 3»**, una vez al día a las 3:00 en la PC con Windows (nadie la usa y el límite de Claude está entero). En una corrida: **3 videos nuevos, montados, con su texto y programados**. JIS solo aprieta «Publicar» en TikTok y «Subir» en YouTube desde el panel.

`<proyecto>` = la carpeta Titeres. Python: `<proyecto>\.motor\venv\Scripts\python`.

## 0. Antes de empezar
- **Solo en la PC con Windows.** Si esta compu es una Mac (macOS), PARA y termina diciendo que la rutina solo corre en la PC.
- `cd <proyecto>\panel && npm run estado` → si Instagram o TikTok no están conectados, PARA y anótalo en `3 Publicado\notas.md`.
- Lee `CLAUDE.md` entero.

## 1. Quién gana (sin ver videos)
- `python .motor\ganadores.py` → actualiza el RESULTADO dentro de cada `que-se-hizo.txt` y deja `3 Publicado\ganadores.md`.
- Lee `ganadores.md` y abre los `que-se-hizo.txt` de los 3 mejores y los 3 peores. Busca qué se repite en los que ganan **en el texto** (tema, primera palabra, gancho, estructura, largo, narrador, cierre) **y en la edición** (mundo, fotos, clips, subtítulos, portada).
- Anota en `3 Publicado\aprendizajes.md` (arriba, con fecha) en 3-5 líneas qué crees que está funcionando y qué no. Ese archivo es la memoria larga: léelo siempre.
- Las dos primeras semanas son ruido: explora. Desde la semana 4: de cada 10 videos, 7 con la fórmula que gana, 2 con la rival y 1 algo nuevo.

## 2. Los temas del día (3 videos)
- **Al menos 1 de los 3 es lo que la gente está hablando HOY**: la noticia que le está doliendo al mundo o la tendencia del momento (como lo de los bancos de Paraguay). No es dar la noticia: es contar la historia detrás de lo que todos comentan, lo que da morbo o lo que la gente quiere entender. Búscalo en la web antes que nada:
  - Lo más buscado y comentado en Latinoamérica (Google Trends por país: México, Colombia, Argentina, Perú, Ecuador, Chile, Paraguay), tendencias de X y de TikTok (Creative Center), lo más leído de medios grandes (Infobae, El País, BBC Mundo, CNN en Español, El Comercio, El Tiempo).
  - Elige lo que tenga una historia con giro y que se pueda contar en menos de un minuto. Si es muy fresco, cuenta solo lo confirmado por dos medios.
- Los otros 2: de los tipos de siempre (historia absurda, persona increíble, error de millones, golpe/estafa, política de cualquier época, crimen, inventos) o de `1 Historias\banco.md`, según lo que diga el paso 1.
- Reglas: dos fuentes, la gente real solo dice lo que dijo, nada sexual ni religioso, sin difamar. Nunca «moraleja»: cierre con fuerza.
- Si una noticia es buena pero se queda corta, anótala en `banco.md` para otro día.

## 3. Cada video (repite 3 veces)
1. **Carpeta**: `python .motor\nueva_funcion.py "Título corto"` → crea `2 Funciones\NNN. Título\` con el **mismo nombre que tendrá en el panel**. Todo lo de ese video vive ahí.
2. **Guion** (`guion.txt`): `QUIEN [emoción]: texto` · `...` pausa · `*palabra*` fuerza · fuentes arriba con `#`. Escríbelo copiando lo que gana y cambiando **una o dos cosas** a propósito (anótalas en «Lo nuevo que se probó»).
3. **Etiquetas** (`etiquetas.json`): tipo, duracion (20-30 s | 35-45 s | 55-70 s), gancho, cierre, narrador, voz, edicion, novedad. Son las columnas de «Qué está ganando» en el panel.
4. **Lo real**: fotos y clips de donde estén (la noticia, YouTube con `yt-dlp`, Wikimedia), 2-4 s, con la fuente chiquita abajo y sin más texto. Clips a fotogramas (`ffmpeg … fps=30`) en `clips\`.
5. **Voz**: dentro de la carpeta, `python ..\..\.motor\voces.py . qwen`.
6. **Película**: reescribe las funciones de la escena en `plantilla.html` (el ejemplo es la guerra de los emús): mundo de papel continuo, la cámara entra a cada lugar, personas reales dibujadas parecidas (y su foto si es histórico), la boca con la voz, nada delante que estorbe, nada amontonado, subtítulos sin «...» ni «:». Cada cosa se ata a una palabra con `W("palabra", n)`. Ajusta efectos y clips de audio en `construir.py`.
   `python construir.py qwen` y `npx --yes hyperframes@0.8.33 render -o salida\video.mp4`.
   Saca fotogramas de los momentos clave y míralos ANTES de seguir; arregla lo que se vea mal.
7. **Portada**: `python ..\..\.motor\portada.py escena.png "ARRIBA" "ABAJO" portada.jpg limpio.png` (escena sin subtítulo, titular bajo las caras, sin número).
8. **Texto de la publicación** (`texto.txt`): 1-2 frases que den ganas (≤125 caracteres), una línea «Fuentes: …» y 5 hashtags.
9. **`que-se-hizo.txt`: llénalo ENTERO.** Es lo único que queda del video. Tiene que bastar para entenderlo y replicarlo sin verlo: duración, tema, primera palabra, gancho literal, estructura con segundos, narrador, cierre literal, mundo y lugares, fotos y clips (cuántos, de dónde, cuándo), subtítulos, música, portada, texto, qué se repitió de qué ganador, qué se probó nuevo, la hipótesis, el guion completo y cómo se armó (incluido lo que falló y cómo se arregló).

## 4. Programar
- Horas de ese mismo día (Ecuador), una por video, variando ±20 min cada día y sin repetir la del día anterior: cerca de **11:30**, **16:00** y **20:30**. La noticia del día va en la primera.
- `cd <proyecto>\panel && npm run programar -- --carpeta "..\2 Funciones\NNN. Título" --hora "AAAA-MM-DD HH:MM" --probar`, y si todo está bien, lo mismo sin `--probar`.
- Anota la hora en `que-se-hizo.txt` y una línea en `3 Publicado\registro.csv`: fecha, nombre, hora, tipo, gancho, cierre.

## 5. Limpiar (siempre)
- `python .motor\limpiar.py "2 Funciones\NNN. Título"` → quedan solo `guion.txt`, `que-se-hizo.txt`, `etiquetas.json`, `texto.txt`. El video ya está en el panel (el panel lo borra cuando sale en todas las redes).

## 6. Si algo falla
- Si una misma cosa falla dos veces (voz, render, subida), salta ese video, sigue con los otros y deja la nota en `3 Publicado\notas.md`. Mejor 2 buenos que 3 rotos.
- Si a las 7:30 no terminaste, programa lo que esté listo y deja nota.

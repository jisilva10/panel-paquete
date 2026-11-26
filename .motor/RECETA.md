# La rutina de las 3 a. m. · es_enserio.tv

La corren 3 tareas programadas en la PC con Windows, **una por video y cada una en su propia sesión** (3:00 video 1 = quién gana + elegir las 3 mejores del día; 4:15 video 2; 5:30 video 3; ver `.motor/tarea-programada.md`). Entre las tres: **3 videos nuevos, montados, con su texto y programados**. Cada sesión hace los pasos de abajo para su único video. JIS solo aprieta «Publicar» en TikTok y «Subir» en YouTube desde el panel.

`<proyecto>` = la carpeta Titeres. Python: `<proyecto>\.motor\venv\Scripts\python`.

## 0. Antes de empezar
- **¿Es la PC?** Corre `python -c "import platform; print(platform.system())"`. Si NO dice `Windows`, PARA ya: no toques nada y termina diciendo «la rutina solo corre en la PC con Windows».
- **¿Está todo?** `python .motor\revisar.py`. Si dice FALTA, arréglalo antes de seguir (o anótalo en `notas.md` si no se puede).
- **Traer los cambios de la Mac**: en `<proyecto>`, `git pull --rebase`. JIS hace cambios desde la Mac (reglas, receta, motor, plantillas) y llegan por GitHub. Si el pull choca, quédate con la versión de GitHub para todo lo que no sea `2 Funciones` y `3 Publicado`, y anótalo en `notas.md`.
- `cd <proyecto>\panel && npm run estado` → si Instagram o TikTok no están conectados, PARA y anótalo en `3 Publicado\notas.md`.
- Lee `CLAUDE.md` entero.

## 1. Quién gana (sin ver videos)
- `python .motor\ganadores.py` → actualiza el RESULTADO dentro de cada `que-se-hizo.txt` y deja `3 Publicado\ganadores.md`.
- Lee `ganadores.md` y abre los `que-se-hizo.txt` de los 3 mejores y los 3 peores. Busca qué se repite en los que ganan **en el texto** (tema, primera palabra, gancho, estructura, largo, narrador, cierre) **y en la edición** (mundo, fotos, clips, subtítulos, portada).
- Anota en `3 Publicado\aprendizajes.md` (arriba, con fecha) en 3-5 líneas qué crees que está funcionando y qué no. Ese archivo es la memoria larga: léelo siempre.
- Mira también «Por tema» en `ganadores.md`: el mejor y el peor **de cada tema**. Lo que gana se aprende **para cada tema por separado** (cómo se escribe bien una noticia, cómo se escribe bien una estafa…), no para quedarse en un solo tema.
- Las dos primeras semanas son ruido: explora. Desde la semana 4: de cada 10 videos, 7 con la forma que gana **en ese tema** (gancho, estructura, cierre, edición), 2 con la rival y 1 algo nuevo.

## 2. Las 3 mejores historias del día — sin rotación fija
- **Se eligen las 3 MEJORES que encuentres, de cualquier tema** (JIS, 25/11/2026). No hay cuota de noticias ni rotación: si las 3 mejores son del mismo tema, van las 3.
- Busca candidatas en TODO, al menos 8-10 antes de elegir:
  - Lo que la gente está hablando HOY: Google Trends por país (México, Colombia, Argentina, Perú, Ecuador, Chile, Paraguay), tendencias de X y de TikTok (Creative Center), lo más leído de Infobae, El País, BBC Mundo, CNN en Español, El Comercio, El Tiempo. Con noticias no se da la noticia: se cuenta la historia detrás, lo que da morbo o lo que la gente quiere entender. Si es muy fresca, solo lo confirmado por dos medios.
  - Historias de cualquier época en la web y en `1 Historias\banco.md`: absurdas, personas increíbles, errores de millones, golpes y estafas, política, crimen, inventos y ciencia, Latinoamérica.
- Ponles nota y elige las 3 que más hagan decir «¿en serio?»: giro imposible, que se entienda y enganche en el primer segundo, que se pueda contar en menos de un minuto, que haya fotos o clips reales, y lo que dice `ganadores.md` / `aprendizajes.md` que funciona. Lo fresco (tendencia de hoy) suma, no es obligatorio.
- **El video 1 deja la lista en `3 Publicado\hoy.md`** (y hace push en ese momento): fecha, las 3 elegidas en orden (#1, #2, #3) con su tema, por qué y sus dos fuentes, más 2 de reserva. Los videos 2 y 3 hacen `git pull --rebase`, toman la #2 y la #3; si ya no sirve (se hizo, falló, salió mal), la siguiente de reserva. Si `hoy.md` no tiene la fecha de hoy, esa sesión busca y elige ella misma la mejor que no esté hecha.
- Temas (para el `Tipo` de `que-se-hizo.txt` y `etiquetas.json`, exactamente así): noticia/tendencia · historia absurda · persona increíble · error de millones · golpe/estafa · política · crimen · inventos y ciencia · latinoamérica. Se siguen midiendo por tema para aprender a escribir mejor cada uno.
- Reglas: dos fuentes, la gente real solo dice lo que dijo, nada sexual ni religioso, sin difamar. Nunca «moraleja»: cierre con fuerza.
- Si una noticia es buena pero se queda corta, anótala en `banco.md` para otro día.
- **Nunca repetir.** Con la historia elegida, corre `python .motor\ya_hecho.py "protagonista" "lugar" "palabra clave"`. Si dice «YA SE HIZO», elige otra (ni la misma historia ni el mismo protagonista, aunque sea con otro ángulo). Mira también `registro.csv` de hoy: otra sesión pudo haber elegido algo parecido. Si la sacaste de `banco.md`, tácha la línea (`~~ ~~`) apenas la elijas y haz `git add -A`, commit y `git push` en ese momento, para que las otras sesiones lo vean.
- Antes de escribir el guion, `python .motor\ya_hecho.py --lista`: el gancho, el cierre y el título tienen que ser frases nuevas (se copia la forma que gana, nunca el texto).

## 3. Cada video (repite 3 veces)
1. **Carpeta**: `python .motor\nueva_funcion.py "Título corto"` → crea `2 Funciones\NNN. Título\` con el **mismo nombre que tendrá en el panel**. Todo lo de ese video vive ahí.
2. **Guion** (`guion.txt`): `QUIEN [emoción]: texto` · `...` pausa · `*palabra*` fuerza · fuentes arriba con `#`. Escríbelo copiando lo que gana y cambiando **una o dos cosas** a propósito (anótalas en «Lo nuevo que se probó»).
3. **Etiquetas** (`etiquetas.json`): tipo, duracion (20-30 s | 35-45 s | 55-70 s), gancho, cierre, narrador, voz, edicion, novedad. Son las columnas de «Qué está ganando» en el panel.
4. **Lo real**: fotos y clips de donde estén (la noticia, YouTube con `yt-dlp`, Wikimedia), 2-4 s, con la fuente chiquita abajo y sin más texto. Clips a fotogramas (`ffmpeg … fps=30`) en `clips\`.
5. **Voz**: dentro de la carpeta, `python ..\..\.motor\voces.py . qwen rapido`. **Ritmo** (JIS, 25/11/2026: pausas dramáticas sí, pero cortas; lo lento aburre): `rapido` es el normal (silencios de 0,28 s como mucho y 7 % más ágil); `medio` y `dramatico` se prueban de vez en cuando (1 de cada 5) para medir. Anótalo en `etiquetas.json` → `"ritmo"` y en «Ritmo de la voz» del `que-se-hizo.txt`.
6. **Película**: reescribe las funciones de la escena en `plantilla.html` (el ejemplo es la guerra de los emús): mundo de papel continuo, la cámara entra a cada lugar, personas reales dibujadas parecidas (y su foto si es histórico), la boca con la voz, nada delante que estorbe, nada amontonado, subtítulos sin «...» ni «:». Cada cosa se ata a una palabra con `W("palabra", n)`. Ajusta efectos y clips de audio en `construir.py`.
   `python construir.py qwen` y `npx --yes hyperframes@0.8.33 render -o salida\video.mp4`.
   **Revisa TODOS los fotogramas** (JIS, 25/11/2026: en el video 1 el letrero de «CARTAGENA» salía cortado y nadie lo vio): `ffmpeg -i salida\video.mp4 -vf "fps=1,scale=240:426,tile=6x2" hoja_%02d.jpg` → una hoja por cada 12 s, un fotograma por segundo, y míralas todas ANTES de seguir. Busca: letreros o textos cortados por el borde, títeres fuera de cuadro o tapándose, fotos cortadas, cosas encima de los subtítulos, escenas vacías. Arregla y vuelve a renderizar hasta que ninguna hoja tenga fallas.
7. **Portada**: `python ..\..\.motor\portada.py escena.png "ARRIBA" "ABAJO" portada.jpg limpio.png` (escena sin subtítulo, titular bajo las caras, sin número).
8. **Texto de la publicación** (`texto.txt`): 1-2 frases que den ganas (≤125 caracteres), una línea «Fuentes: …» y 5 hashtags.
9. **`que-se-hizo.txt`: llénalo ENTERO.** Es lo único que queda del video. Tiene que bastar para entenderlo y replicarlo sin verlo: duración, tema, primera palabra, gancho literal, estructura con segundos, narrador, cierre literal, mundo y lugares, fotos y clips (cuántos, de dónde, cuándo), subtítulos, música, portada, texto, qué se repitió de qué ganador, qué se probó nuevo, la hipótesis, el guion completo y cómo se armó (incluido lo que falló y cómo se arregló).

## 4. Programar
- Horas de ese mismo día (Ecuador), una por video, variando ±20 min cada día y sin repetir la del día anterior: cerca de **11:30**, **16:00** y **20:30**. La #1 de `hoy.md` va en la primera (si una es noticia fresca, conviene que salga antes).
- `cd <proyecto>\panel && npm run programar -- --carpeta "..\2 Funciones\NNN. Título" --hora "AAAA-MM-DD HH:MM" --probar`, y si todo está bien, lo mismo sin `--probar`.
- Anota la hora en `que-se-hizo.txt` y una línea en `3 Publicado\registro.csv`: fecha, nombre, hora, tipo, gancho, cierre.

## 5. Limpiar (siempre)
- `python .motor\limpiar.py "2 Funciones\NNN. Título"` → quedan `guion.txt`, `que-se-hizo.txt`, `etiquetas.json`, `texto.txt`, **`video.mp4`** (sube de `salida\`) y `portada.jpg`. **El video se queda siempre en la carpeta** para que JIS lo vea antes (decisión de JIS, 25/11/2026); se borra solo lo de trabajo (clips, fotos, voz, plantilla). El video y la portada no van a GitHub.

## 6. Si algo falla
- Si una misma cosa falla dos veces (voz, render, subida), salta ese video, sigue con los otros y deja la nota en `3 Publicado\notas.md`. Mejor 2 buenos que 3 rotos.
- Si a las 7:30 no terminaste, programa lo que esté listo y deja nota.

## 7. Guardar en GitHub (siempre, al final)
- En `<proyecto>`: `git add -A`, `git commit -m "Rutina AAAA-MM-DD: <los 3 nombres>"` y `git push`. Así la Mac también tiene los textos, los aprendizajes y el registro. Si el push choca, `git pull --rebase` y vuelve a empujar.

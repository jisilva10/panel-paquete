# es_enserio.tv — «¿En serio?»

Cuenta de historias **reales** que no te vas a creer, contadas con **títeres de papel** y **voz IA**, en **TikTok, Instagram y YouTube Shorts**. Español para toda Latinoamérica. Dueño: JIS (también lleva Noerion, que es otro proyecto).

**JIS no hace nada aquí.** Claude escribe, monta, programa y mide. JIS solo toca «Publicar» en TikTok desde el panel (por ahora). YouTube e Instagram salen solos. JIS no usa la terminal: los comandos los corre Claude.
**Vía libre**: «te dejo la pauta en absolutamente todo». Se prueba de todo (historia, duración, gancho, cierre, edición, subtítulos) hasta dar con la ganadora; a esa se le meten todas las fichas, con espacio para mejorar.

Si esta carpeta acaba de llegar a una compu nueva, lee primero **MUDANZA.md**.

## Lo que se cuenta
- Lo más loco que pasó en el mundo, lo que esté en **tendencia** (noticias de esta semana, gente famosa) y cualquier historia buena: historia, política de cualquier época, crimen, estafas, inventos, personas increíbles, Latinoamérica.
- **Nada sexual ni religioso.** No es para niños: historias «chéveres», crudas e interesantes.
- **Dos fuentes** por historia, anotadas arriba del guion. **La gente real solo dice lo que dijo de verdad**; los diálogos inventados, solo para animales, objetos o personajes sin nombre. Sin difamar: lo que dicen las noticias. (Ej.: Jensen Huang salió de Nvidia — se cuenta por qué salió, con lo que dicen las noticias, sin entrar a lo sexual.)
- Nunca se dice «moraleja». Cierra una **frase con fuerza**: dato que remata, ironía, vuelta al gancho (bucle), la frase del protagonista o una pregunta. El estilo se rota y se mide.
- **Sin elenco fijo**: siempre personajes nuevos.
- **Nunca se repite nada** (JIS, 25/11/2026): ni la historia, ni el protagonista, ni el gancho o el cierre literal, ni el título. Antes de elegir, `python .motor\ya_hecho.py "protagonista" "lugar" "palabra clave"`: si dice «YA SE HIZO», se busca otra. Antes de escribir el gancho y el cierre, `python .motor\ya_hecho.py --lista` para no copiar frases. Se aprende la forma que gana, nunca se recicla el texto. Al usar una historia del banco, se tacha (`~~ ~~`).
- **Cada día, las 3 MEJORES historias que se encuentren, de 3 temas distintos** (JIS, 25 y 26/11/2026): sin cuota de noticias, pero los temas rotan: nunca dos del mismo tema (ni del mismo país o la misma guerra) el mismo día, y en la semana pasan todos. Se busca en todos los temas (noticia/tendencia · historia absurda · persona increíble · error de millones · golpe/estafa · política · crimen · inventos y ciencia · latinoamérica), se juntan candidatas y se eligen las que más hagan decir «¿en serio?». Lo que es tendencia HOY suma (llegar a tiempo lo hace viral; contar la historia detrás de lo que todos comentan, no dar la noticia), pero no es obligatorio.

## Cómo se ve
- **Mundo de papel** que ayuda a entender (no retablo ni marco de teatro): un solo lugar continuo por historia y la cámara **entra** a cada lugar, con transiciones; nada pegado encima de otra cosa, nada amontonado, nada delante que estorbe (nada de trigo o paja delante).
- **Títeres** de papel con borde blanco, en palito; **la boca se abre con la voz**. Las personas reales, **dibujadas parecidas** a su versión real; si es histórica, también su **foto**.
- **Fotos y clips reales** de donde estén (noticias, YouTube, archivos), en trozos cortos (2-4 s) y **dentro** del mundo (la foto se levanta del suelo; el clip se ve por el visor de una cámara o algo de la escena). Siempre con la **fuente chiquita abajo** y sin llenarlos de texto.
- **Subtítulos** de hasta 3 palabras, la que suena resaltada, **sin «...» ni «:»**. El estilo de los subs se puede jugar.
- Sonido de verdad: música que se aparta de la voz, efectos de papel, el audio original del clip. Todo a −14 LUFS.
- Tipografías: Bagel Fat One (portada y marca), Lilita One (subtítulos), Rye (letreros). Amarillo #ffd23f, tinta #1f1622, papel #f5efe2.
- **Portada**: una escena del video, sin subtítulo, titular en dos placas debajo de las caras, sin número.

## Voz
- **Qwen3-TTS** (local, gratis, Apache 2.0), con la voz diseñada por descripción. Cada línea del guion lleva su emoción: `QUIEN [emoción]: texto`; `...` = pausa larga; `*palabra*` = con fuerza. Los números se leen en palabras (si no, sale acento inglés).
- No se paga voz hasta que la cuenta gane plata.

## Dónde está cada cosa
- `.motor/RECETA.md` — **la rutina de las 3 a. m. paso a paso** (la sigue la tarea programada).
- `.motor/nueva_funcion.py` (crea la carpeta de un video), `.motor/ganadores.py` (quién gana, cruzando el panel con los textos), `.motor/laboratorio.py` + `.motor/variables.json` (qué palanca gana y qué probar en cada video), `.motor/palancas.py` (copia las palancas al que-se-hizo), `.motor/limpiar.py` (deja el texto, el video y la portada), `.motor/voces.py` (voz), `.motor/portada.py` (portada), `.motor/plantillas/` (guion y qué se hizo), `.motor/base/` (plantilla de la película: la guerra de los emús), `fuentes/`, `sonidos/`, `musica/`.
- `1 Historias/banco.md` — banco de historias con fuentes.
- `2 Funciones/NNN. Título/` — cada video, con **el mismo nombre que tiene en el panel** (el panel toma el nombre de la carpeta). Después de programar quedan **los textos y el video**: `guion.txt`, `que-se-hizo.txt`, `etiquetas.json`, `texto.txt`, **`video.mp4`** y `portada.jpg` (decisión de JIS, 25/11/2026: cada video se queda en su carpeta para que JIS lo vea antes). Lo de trabajo (clips, fotos, voz) se borra. El video y la portada no van a GitHub: quedan en la PC.
- `3 Publicado/` — `ganadores.md` (lo genera ganadores.py), `aprendizajes.md` (la memoria larga: qué funciona y qué no, con fecha), `registro.csv` y `notas.md`.
- `marca/` — fotos de perfil (la elegida es **perfil-a**), banner, textos de perfil.
- `panel/` — el panel (Next.js) en **https://funciones-panel.vercel.app** (Vercel, cuenta jisilva10s-projects, proyecto funciones-panel). Tiene un interruptor **¿En serio? | Noerion** dentro de la misma dirección (JIS lo usa como app en la pantalla de inicio: nunca debe saltar a otra URL). Tema claro siempre. Arriba en el inicio, **«Por salir»** (vistazo): cada video en cola con su portada; si JIS quiere, lo toca y lo ve antes de que salga (no aprueba nada: sale igual a su hora). Solo se ve mientras está «programada»; después desaparece y el almacén lo borra como siempre. También «Ver» en la cola de /programar. Solo en ¿En serio?, no en Noerion. Los avisos rojos de error tienen «×» para quitarlos (se recuerda en ese teléfono; un error nuevo vuelve a salir).

## Dos compus, una sola carpeta (GitHub)
- La carpeta vive en GitHub: **github.com/jisilva10/panel-paquete** (rama `main`). La **Mac** es donde JIS pide cambios; la **PC con Windows** es la que produce.
- **Siempre** al empezar a trabajar, en cualquiera de las dos: `git pull --rebase`. **Siempre** al terminar un cambio: `git add -A`, `git commit` y `git push`. Un cambio que no se empuja no llega a la otra compu.
- **Esto ya pasa solo** (JIS, 26/11/2026: «que funcione así para siempre, sea tarea programada o chat nuevo»): `.claude/settings.json` engancha `.claude/hooks/sincronizar.mjs` a toda sesión abierta en Titeres. Al abrir la sesión trae GitHub; cada vez que Claude termina de responder guarda lo cambiado («Automático: cambios de la PC/Mac») y lo sube. En la Mac también va en `~/.claude/settings.json` (con `--desde-fuera`) para las sesiones abiertas en otra carpeta que tocan Titeres. Igual haz tu commit con buen mensaje cuando cierres algo: el automático es la red de seguridad.
- Si al abrir la sesión ves **«⚠️ Titeres/GitHub»**, para y arréglalo antes de tocar nada: casi siempre es que las dos compus cambiaron las mismas líneas. `git pull --rebase`, junta las dos versiones (la de GitHub manda en reglas, receta y motor; en `2 Funciones` y `3 Publicado` se conservan las dos), `git rebase --continue` y `git push`.
- Firma de los commits: `jisilva10 <jisilva10@users.noreply.github.com>` (nunca el correo de JIS).
- Nunca van a GitHub: llaves, `.secretos/`, `.env*`, `venv/`, `node_modules/`, videos, audio ni fotogramas.
- La rutina de las 3 a. m. corre **solo si el sistema es Windows** (`platform.system()`); en la Mac no produce nada.

## Cuentas y conexiones (ya hechas el 25/11/2026)
- Instagram **@es_enserio.tv** (creador): conectado al panel con la app de Meta «Noerion Radar» (IG app id 2186900705205162; las apps nuevas de Meta ya no permiten inicio de sesión con Instagram).
- TikTok **@es_enserio.tv**: app «Panel enserio», Sandbox «enserio»; llega a borradores y JIS publica.
- YouTube **@es_enseriotv** (canal UC4s1duOWIwU7mWkaZfNpvsQ): el panel lee los números con una llave de Google (proyecto «enseriotv») y **sube solo** desde el 25/11/2026 (OAuth `youtube.upload` conectado, interruptor `YT_SUBIR_SOLO=1` en Vercel; primer video subido por API: el 001, público). El título de YouTube es la primera línea de `texto.txt` (máx. 100 caracteres): que esa primera línea quepa entera.
- Las llaves viven **solo en Vercel** (nunca en esta carpeta ni en GitHub). La compu habla con el panel con su propia llave en `panel/.secretos/mac.txt` (no va a GitHub).

## La rutina de las 3 a. m.
**La producción corre SOLO en la PC con Windows** (decisión de JIS, 26/11/2026), que queda prendida de noche. La Mac de JIS no produce ni programa nada: su tarea está apagada y su llave del panel queda anulada cuando la PC crea la suya.
**Cada video va en su propia sesión** (decisión de JIS, 25/11/2026, para no gastar el límite): son 3 tareas programadas de Claude, **«es_enserio: rutina de las 3 — video 1»** a las 3:00, **«— video 2»** a las 4:15 y **«— video 3»** a las 5:30 (nadie usa la PC y el límite de Claude está entero). El video 1 ve quién gana, anota aprendizajes, busca candidatas en todos los temas y deja en `3 Publicado\hoy.md` las 3 mejores del día, de 3 temas distintos, en orden y con su franja de hora (más 2 de reserva); **cada sesión mira el laboratorio**, escribe, monta, programa (a la hora que le toca) y limpia **su** historia, sin usar la tarjeta a la vez. Las tareas se actualizan solas desde `.motor/tarea-programada.md` (paso 0 de la RECETA). Texto exacto de las tareas: `.motor/tarea-programada.md`. Pasos: `.motor/RECETA.md`.

## Cómo medir — cada video es un experimento
- **JIS, 26/11/2026**: «que cada video, antes de escoger la historia, abra el panel y vea cuáles están ganando, abra los ganadores en el txt y después edite siempre probando cosas nuevas, pero en la misma línea de los ganadores». 3 videos al día = 21 pruebas por semana, hasta dar con el video perfecto. Los temas igual rotan.
- **Las palancas** viven en `.motor/variables.json` (~30): tema, época, lugar, tono · gancho, primera palabra, desarrollo, giros, narrador, quién habla, frase final, pedir comentario · transición, cortes, cámara, fotos y clips, cómo entran, letreros, primer segundo, subtítulos, música, volumen, efectos, audio real, silencios · duración, pausas y velocidad de la voz, portada (escena y titular), texto de la publicación · hora de subida. La **raíz no se prueba** (mundo de papel, títeres, boca con la voz, lo real dentro del mundo, tipografías, colores, reglas de las historias).
- **Los 3 videos** corren `python .motor\laboratorio.py --video K` antes de elegir: lee el panel, dice qué opción va ganando en cada palanca, arma el plan del video (**BASE** = lo que gana + **PRUEBAS** = lo que se cambia a propósito, lo menos probado primero, sin repetir lo que prueba otro video de hoy), reparte la hora de hoy (3 franjas distintas que rotan) y dice qué temas faltan. Después se abren los `que-se-hizo.txt` de los ganadores que lista. Con `--carpeta` escribe el plan en el `etiquetas.json` del video, y el video se hace siguiendo ese archivo.
- Fase explorar (hasta el 16/12/2026 o 30 videos con 48 h): 3 pruebas por video. Después: de cada 10, 7 «ganador» (fórmula + 1 prueba), 2 «rival», 1 «nuevo». **Nunca un video sin pruebas.** Una opción «va ganando» con 3+ videos de 48 h y 20 % más que la segunda; desde ahí es la base de todos.
- **Se aprende por el texto, no por los videos.** Cada video deja `etiquetas.json` (lo que SE HIZO, con los valores exactos de `variables.json`) y su `que-se-hizo.txt` entero (con una línea por prueba; el bloque PALANCAS lo copia solo `limpiar.py`). `ganadores.py` escribe dentro de cada uno su resultado a las 48 h y arma `3 Publicado/ganadores.md`; `laboratorio.py --guardar` deja `3 Publicado/laboratorio.md`.
- El panel muestra «Qué está ganando»: vistas promedio por cada palanca (de `etiquetas.json` de cada función).
- Monetizar: YouTube (1.000 suscriptores + 10 M vistas de Shorts en 90 días). TikTok no paga en Ecuador. Cuidado con «contenido no auténtico» de YouTube: cada función tiene que ser distinta de verdad. Recopilaciones largas: más adelante, JIS avisa.

## No tocar
Nada de Noerion ni de su panel (salvo el botón que lleva a este). Nunca subir llaves a GitHub.

# es_enserio.tv — «¿En serio?»

Cuenta de historias **reales** que no te vas a creer, contadas con **títeres de papel** y **voz IA**, en **TikTok, Instagram y YouTube Shorts**. Español para toda Latinoamérica. Dueño: JIS (también lleva Noerion, que es otro proyecto).

**JIS no hace nada aquí.** Claude escribe, monta, programa y mide. JIS solo toca «Publicar» en TikTok y «Subir» en YouTube desde el panel (por ahora). JIS no usa la terminal: los comandos los corre Claude.
**Vía libre**: «te dejo la pauta en absolutamente todo». Se prueba de todo (historia, duración, gancho, cierre, edición, subtítulos) hasta dar con la ganadora; a esa se le meten todas las fichas, con espacio para mejorar.

Si esta carpeta acaba de llegar a una compu nueva, lee primero **MUDANZA.md**.

## Lo que se cuenta
- Lo más loco que pasó en el mundo, lo que esté en **tendencia** (noticias de esta semana, gente famosa) y cualquier historia buena: historia, política de cualquier época, crimen, estafas, inventos, personas increíbles, Latinoamérica.
- **Nada sexual ni religioso.** No es para niños: historias «chéveres», crudas e interesantes.
- **Dos fuentes** por historia, anotadas arriba del guion. **La gente real solo dice lo que dijo de verdad**; los diálogos inventados, solo para animales, objetos o personajes sin nombre. Sin difamar: lo que dicen las noticias. (Ej.: Jensen Huang salió de Nvidia — se cuenta por qué salió, con lo que dicen las noticias, sin entrar a lo sexual.)
- Nunca se dice «moraleja». Cierra una **frase con fuerza**: dato que remata, ironía, vuelta al gancho (bucle), la frase del protagonista o una pregunta. El estilo se rota y se mide.
- **Sin elenco fijo**: siempre personajes nuevos.
- **Los temas rotan siempre**: noticia/tendencia (todos los días) · historia absurda · persona increíble · error de millones · golpe/estafa · política · crimen · inventos y ciencia · latinoamérica. Aunque al público le guste más uno, se sigue rotando: lo que se aprende es a escribir mejor **cada** tema, no a quedarse en uno.
- **Noticias y tendencias, todos los días**: al menos 1 de los 3 videos diarios es lo que la gente está hablando HOY (lo que le duele al mundo, lo que es tendencia, como lo de los bancos de Paraguay). No es dar la noticia: es contar la historia detrás de lo que todos comentan, lo que da morbo o lo que la gente quiere entender. Llegar a tiempo es lo que lo hace viral.

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
- `.motor/nueva_funcion.py` (crea la carpeta de un video), `.motor/ganadores.py` (quién gana, cruzando el panel con los textos), `.motor/limpiar.py` (deja solo el texto), `.motor/voces.py` (voz), `.motor/portada.py` (portada), `.motor/plantillas/` (guion y qué se hizo), `.motor/base/` (plantilla de la película: la guerra de los emús), `fuentes/`, `sonidos/`, `musica/`.
- `1 Historias/banco.md` — banco de historias con fuentes.
- `2 Funciones/NNN. Título/` — cada video, con **el mismo nombre que tiene en el panel** (el panel toma el nombre de la carpeta). Después de programar queda **solo texto**: `guion.txt`, `que-se-hizo.txt`, `etiquetas.json`, `texto.txt`. El video se borra.
- `3 Publicado/` — `ganadores.md` (lo genera ganadores.py), `aprendizajes.md` (la memoria larga: qué funciona y qué no, con fecha), `registro.csv` y `notas.md`.
- `marca/` — fotos de perfil (la elegida es **perfil-a**), banner, textos de perfil.
- `panel/` — el panel (Next.js) en **https://funciones-panel.vercel.app** (Vercel, cuenta jisilva10s-projects, proyecto funciones-panel). Tiene un interruptor **¿En serio? | Noerion** dentro de la misma dirección (JIS lo usa como app en la pantalla de inicio: nunca debe saltar a otra URL). Tema claro siempre.

## Dos compus, una sola carpeta (GitHub)
- La carpeta vive en GitHub: **github.com/jisilva10/panel-paquete** (rama `main`). La **Mac** es donde JIS pide cambios; la **PC con Windows** es la que produce.
- **Siempre** al empezar a trabajar, en cualquiera de las dos: `git pull --rebase`. **Siempre** al terminar un cambio: `git add -A`, `git commit` y `git push`. Un cambio que no se empuja no llega a la otra compu.
- Firma de los commits: `jisilva10 <jisilva10@users.noreply.github.com>` (nunca el correo de JIS).
- Nunca van a GitHub: llaves, `.secretos/`, `.env*`, `venv/`, `node_modules/`, videos, audio ni fotogramas.
- La rutina de las 3 a. m. corre **solo si el sistema es Windows** (`platform.system()`); en la Mac no produce nada.

## Cuentas y conexiones (ya hechas el 25/11/2026)
- Instagram **@es_enserio.tv** (creador): conectado al panel con la app de Meta «Noerion Radar» (IG app id 2186900705205162; las apps nuevas de Meta ya no permiten inicio de sesión con Instagram).
- TikTok **@es_enserio.tv**: app «Panel enserio», Sandbox «enserio»; llega a borradores y JIS publica.
- YouTube **@es_enseriotv** (canal UC4s1duOWIwU7mWkaZfNpvsQ): el panel lee los números con una llave de Google (proyecto «enseriotv»); JIS sube desde la tarjeta «Subir».
- Las llaves viven **solo en Vercel** (nunca en esta carpeta ni en GitHub). La compu habla con el panel con su propia llave en `panel/.secretos/mac.txt` (no va a GitHub).

## La rutina de las 3 a. m.
**La producción corre SOLO en la PC con Windows** (decisión de JIS, 26/11/2026), que queda prendida de noche. La Mac de JIS no produce ni programa nada: su tarea está apagada y su llave del panel queda anulada cuando la PC crea la suya.
Una sola tarea programada de Claude, **«es_enserio: rutina de las 3»**, todos los días a las 3:00 (nadie usa la PC y el límite de Claude está entero). En esa corrida: ver quién gana → leer los `que-se-hizo.txt` de los ganadores → escribir 3 guiones (al menos uno de la noticia/tendencia del día) → montar los 3 → llenar su `que-se-hizo.txt` → programarlos para ese día → limpiar. Texto exacto de la tarea: `.motor/tarea-programada.md`. Pasos: `.motor/RECETA.md`.

## Cómo medir
- **Se aprende por el texto, no por los videos.** Cada video deja su `que-se-hizo.txt` (tema, primera palabra, gancho literal, estructura, largo, narrador, cierre literal, edición, qué se probó, hipótesis y guion completo). `ganadores.py` escribe dentro de cada uno su resultado a las 48 h y arma `3 Publicado/ganadores.md`; de ahí salen los guiones nuevos.
- El panel muestra «Qué está ganando»: vistas promedio por tipo, duración, gancho, cierre, voz y edición (de `etiquetas.json` de cada función).
- Las dos primeras semanas son ruido. Desde la semana 4: 7 de cada 10 con la fórmula que gana, 2 con la rival, 1 algo nuevo.
- Monetizar: YouTube (1.000 suscriptores + 10 M vistas de Shorts en 90 días). TikTok no paga en Ecuador. Cuidado con «contenido no auténtico» de YouTube: cada función tiene que ser distinta de verdad. Recopilaciones largas: más adelante, JIS avisa.

## No tocar
Nada de Noerion ni de su panel (salvo el botón que lleva a este). Nunca subir llaves a GitHub.

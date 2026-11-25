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
- `.motor/RECETA.md` — **la receta paso a paso de una función** (la sigue el disparador).
- `.motor/voces.py` (voz), `.motor/portada.py` (portada), `.motor/base/` (plantilla de la película: la guerra de los emús), `fuentes/`, `sonidos/`, `musica/`.
- `1 Historias/banco.md` — banco de historias con fuentes.
- `2 Funciones/AAAA-MM-DD/NN-slug/` — cada video (guion, etiquetas, texto, portada, MP4).
- `3 Publicado/registro.csv` y `notas.md`.
- `marca/` — fotos de perfil (la elegida es **perfil-a**), banner, textos de perfil.
- `panel/` — el panel (Next.js) en **https://funciones-panel.vercel.app** (Vercel, cuenta jisilva10s-projects, proyecto funciones-panel). Tiene un interruptor **¿En serio? | Noerion** dentro de la misma dirección (JIS lo usa como app en la pantalla de inicio: nunca debe saltar a otra URL). Tema claro siempre.

## Cuentas y conexiones (ya hechas el 25/11/2026)
- Instagram **@es_enserio.tv** (creador): conectado al panel con la app de Meta «Noerion Radar» (IG app id 2186900705205162; las apps nuevas de Meta ya no permiten inicio de sesión con Instagram).
- TikTok **@es_enserio.tv**: app «Panel enserio», Sandbox «enserio»; llega a borradores y JIS publica.
- YouTube **@es_enseriotv** (canal UC4s1duOWIwU7mWkaZfNpvsQ): el panel lee los números con una llave de Google (proyecto «enseriotv»); JIS sube desde la tarjeta «Subir».
- Las llaves viven **solo en Vercel** (nunca en esta carpeta ni en GitHub). La compu habla con el panel con su propia llave en `panel/.secretos/mac.txt` (no va a GitHub).

## El disparador
**La producción corre SOLO en la PC con Windows** (decisión de JIS, 26/11/2026). La Mac de JIS no produce ni programa nada: su disparador está apagado y su llave del panel queda anulada cuando la PC crea la suya.
Tarea programada de Claude **«es_enserio: una función»**, cada 3 horas mientras la app de Claude esté abierta. Una función por corrida, solo si hay menos de 6 en la cola. Sigue `.motor/RECETA.md`. Si algo falla dos veces, deja nota en `3 Publicado/notas.md`.

## Cómo medir
- El panel muestra «Qué está ganando»: vistas promedio por tipo, duración, gancho, cierre, voz y edición (de `etiquetas.json` de cada función).
- Las dos primeras semanas son ruido. Desde la semana 4: 7 de cada 10 con la fórmula que gana, 2 con la rival, 1 algo nuevo.
- Monetizar: YouTube (1.000 suscriptores + 10 M vistas de Shorts en 90 días). TikTok no paga en Ecuador. Cuidado con «contenido no auténtico» de YouTube: cada función tiene que ser distinta de verdad. Recopilaciones largas: más adelante, JIS avisa.

## No tocar
Nada de Noerion ni de su panel (salvo el botón que lleva a este). Nunca subir llaves a GitHub.

# El estilo · la fórmula de «¿En serio?» (viva)

Lo que hoy creemos que es **la mejor forma de hacer un video**, pieza por pieza, y qué se está probando para mejorarla.
Lo actualiza la rutina de las 3:00 (paso 1), **después** de leer `ganadores.md` y `aprendizajes.md`. Cada video nuevo se arma con esta fórmula
(salvo lo que se prueba a propósito, que va en «Lo nuevo que se probó» del `que-se-hizo.txt`).

Estados: **explorando** (sin datos) · **va ganando** (gana con 3+ videos) · **fijo** (gana con 10+ videos y en varios temas) · **descartado**.

## Cómo se decide (la regla)
1. Solo cuentan videos con **48 h** o más (`ganadores.md`). Las 2 primeras semanas son ruido: se explora todo.
2. Se compara **dentro del mismo tema** (una noticia contra otras noticias), y después se mira si se repite en varios temas.
3. Una opción «va ganando» cuando tiene **3+ videos** y su promedio de vistas es **20 % o más** que la rival. Con menos datos, sigue «explorando».
4. **Cada video prueba algo** (JIS, 26/11/2026). Las palancas son las ~30 de `.motor/variables.json` y cada video anota la suya en `etiquetas.json`: así se puede cambiar más de una cosa por video y igual saber cuál funcionó (el laboratorio promedia cada palanca por separado entre todos los videos). Como mucho **una prueba por grupo** (texto · edición y sonido · voz/duración/portada/publicación) y ninguna palanca en dos videos del mismo día.
5. Fase explorar (hasta el 16/12/2026 o 30 videos con 48 h): **3 pruebas por video**. Después, de cada 10: **7** «ganador» (la fórmula + 1 prueba), **2** «rival» (la segunda opción de 2 palancas) y **1** «nuevo» (3 pruebas + una idea nunca hecha). Lo reparte `laboratorio.py` solo.
6. Lo que JIS dice al ver un video **pesa como dato**: se anota aquí con fecha y se aplica de inmediato.

## La fórmula hoy (26/11/2026 · día 2 · explorando, 0 videos con 48 h)

Es la BASE que usa el laboratorio (`3 Publicado/laboratorio.md` tiene el detalle de cada palanca y se rehace cada día). Cuando una palanca pasa a «va ganando», se cambia aquí también.

| Grupo | Hoy se usa (la base) | Lo que más falta probar |
|---|---|---|
| Historia | Las mejores, de 3 temas distintos por día | historia absurda, error de millones, política, crimen, inventos y ciencia · últimos 10 años · África/Oceanía · tono indignante o suspenso |
| Texto | Gancho «dato imposible» en la primera frase · tercera persona · cronológico · 2-3 giros · cierre que remata · sin llamado | gancho en «tú», cifra gigante, final primero, contradicción · lista de 3, misterio al final · cierre en pregunta, «cómo está hoy», giro final · llamado (comentar el video, seguir, like) |
| Edición y sonido | Mundo de papel continuo · la cámara entra por un objeto · 4-5 fotos y clips reales · subtítulos Lilita 84 px abajo · música «historia» al 32 % · 7-14 efectos · audio real bajito | hoja que pasa, iris, zoom rápido · cortes rápidos o tranquilos · parallax · subtítulos al centro o en caja · música de suspenso, chistosa o sin música · silencio antes del giro |
| Voz, duración, portada | Ritmo rápido · velocidad 1.07 · 50-60 s · portada en el clímax con «afirmación + pregunta» | velocidad 1.00 / 1.12 / 1.17 · 30-40 y 40-50 s · portada con la cara o el objeto clave · titular en pregunta sola o cifra |
| Hora | Rota por franjas (3 distintas por día) | mañana (7-10) y noche (18-20) |

La raíz no se prueba: mundo de papel, títeres de papel con borde blanco en palito, boca con la voz, lo real dentro del mundo con la fuente chiquita, tipografías y colores.

## Lo que JIS dijo al ver los videos
- 25/11 · video 1: «la voz se siente lenta: pausas dramáticas sí, pero no tan largas» → ritmo rápido por defecto.
- 25/11 · video 1: «el letrero de Cartagena no se ve» → se revisan **todos** los fotogramas (uno por segundo) y además **cada cuadro** con `revisar_celeste.py`.
- 25/11 · video 1: «hay un flick celeste» → eran cuadros vacíos del render; arreglado en la plantilla base.
- 26/11 · video 006: el sonido del final (el «braam», que salía también en 001, 004 y 005) «suena durísimo» → se borró de `.motor/sonidos/` y no se usa más. El final cierra con la voz y la música.
- 26/11: «que cada video pruebe cosas nuevas en la línea de los ganadores» → el laboratorio (3 pruebas por video en la fase explorar).
- 26/11: el llamado al público nunca es para pedir el próximo tema: es para que comenten **sobre el video**, o para que sigan, den like o compartan.

## Qué se mira en el paso 1 cada día (lista)
1. `ganadores.md`: los 3 mejores y los 3 peores, y «Por tema».
2. `python .motor/laboratorio.py` (lee los números del panel y los cruza con los textos): cada palanca, cuál va ganando, el plan del próximo video y las horas de hoy.
3. Los `que-se-hizo.txt` de los mejores y los peores: primera palabra, gancho literal, estructura con segundos, cierre literal, portada.
4. Retención (cuando IG la dé): ¿en qué segundo se van? Si se van antes de los 3 s, el problema es el gancho; si se van a la mitad, el ritmo o el largo.
5. Compartidos y guardados: dicen qué historia da ganas de mandarla a alguien.
6. Lo que JIS dijo de los videos (arriba).
7. Con todo eso: se actualiza la tabla (estado y «se está probando contra») y se escriben 3-5 líneas en `aprendizajes.md`.

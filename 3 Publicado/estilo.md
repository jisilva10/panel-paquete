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

## La fórmula hoy (25/11/2026 · día 1 · explorando)

El detalle palanca por palanca (cuántos videos tiene cada opción y su puntaje) está en `3 Publicado/laboratorio.md`, que se rehace cada día. Esta tabla es el resumen que se lee rápido: cuando una palanca pasa a «va ganando» en el laboratorio, se cambia aquí también.

| Pieza | Hoy se usa | Estado | Se está probando contra | Por qué |
|---|---|---|---|---|
| Tema | Las 3 mejores historias que se encuentren | explorando | — | Regla de JIS (hoy.md) |
| Gancho | «Dato imposible» en la primera frase | explorando | pregunta · en medio del lío · frase del protagonista | — |
| Primera palabra | Un verbo o un dato («Querían…», «En 1932…») | explorando | — | — |
| Duración | 45-55 s | explorando | 35-45 s · 55-70 s | El video 1 bajó de 68 a 53 s y JIS lo prefirió |
| Ritmo de la voz | **rápido** (silencios ≤0,28 s, +7 %) | explorando, pedido por JIS | medio · dramático (1 de cada 5) | JIS: «se siente lento» (25/11) |
| Narrador | Tercera persona | explorando | segunda persona «tú» | — |
| Gente real que habla | Solo con su frase literal (ej. el rehén) | explorando | — | Regla de la cuenta |
| Cierre | Vuelta al gancho + ironía | explorando | dato que remata · pregunta · frase del protagonista | — |
| Mundo | Un solo lugar de papel continuo, la cámara entra a cada lugar | fijo (regla) | — | CLAUDE.md |
| Transiciones | La cámara entra por un objeto (vitrina, visor) | explorando | hoja de papel que pasa · círculo que se abre | — |
| Lo real | 2 fotos + 1 clip de 3-4 s en visor, con la fuente chiquita | explorando | más clips, menos fotos | — |
| Subtítulos | Lilita 84 px, 3 palabras, amarillo la que suena, y=1580 | explorando | otro tamaño o posición | — |
| Portada | Escena sin subtítulos + 2 placas («17 HORAS DE SECUESTRO» / «¿CON ARMAS DE JUGUETE?») | explorando | titular en pregunta vs. afirmación | — |
| Texto | 1-2 frases ≤125 caracteres + fuentes + 5 hashtags | explorando | — | — |

## Lo que JIS dijo al ver los videos
- 25/11 · video 1: «la voz se siente lenta: pausas dramáticas sí, pero no tan largas» → ritmo rápido por defecto.
- 25/11 · video 1: «el letrero de Cartagena no se ve» → se revisan **todos** los fotogramas (uno por segundo) y además **cada cuadro** con `revisar_celeste.py`.
- 25/11 · video 1: «hay un flick celeste» → eran cuadros vacíos del render; arreglado en la plantilla base.

## Qué se mira en el paso 1 cada día (lista)
1. `ganadores.md`: los 3 mejores y los 3 peores, y «Por tema».
2. `python .motor/laboratorio.py` (lee el panel, «Qué está ganando»): cada palanca, cuál va ganando, el plan del próximo video y las horas de hoy.
3. Los `que-se-hizo.txt` de los mejores y los peores: primera palabra, gancho literal, estructura con segundos, cierre literal, portada.
4. Retención (cuando IG la dé): ¿en qué segundo se van? Si se van antes de los 3 s, el problema es el gancho; si se van a la mitad, el ritmo o el largo.
5. Compartidos y guardados: dicen qué historia da ganas de mandarla a alguien.
6. Lo que JIS dijo de los videos (arriba).
7. Con todo eso: se actualiza la tabla (estado y «se está probando contra») y se escriben 3-5 líneas en `aprendizajes.md`.

Tareas programadas de Claude en la PC con Windows
Cada video va en su propia sesión (decisión de JIS, 25/11/2026), así que son 3 tareas, una por video:

| Tarea | Hora (cron, hora local) | Video | Se programa cerca de |
|---|---|---|---|
| es_enserio: rutina de las 3 — video 1 (noticia) | 3:00 (`0 3 * * *`) | noticia/tendencia del día + quién gana + aprendizajes | 11:30 |
| es_enserio: rutina de las 3 — video 2 | 4:15 (`15 4 * * *`) | 1.º tema de «Temas de hoy» | 16:00 |
| es_enserio: rutina de las 3 — video 3 | 5:30 (`30 5 * * *`) | 2.º tema de «Temas de hoy» | 20:30 |

Las 3 viven en la app de Claude de la PC (barra lateral → Programadas; archivos en `C:\Users\Joaquin\.claude\scheduled-tasks\es-enserio-video-N\SKILL.md`).

Texto común (cada tarea lo lleva con su número, su hora y su tema):

Eres el productor de la cuenta es_enserio.tv («¿En serio?»). Esta corrida hace SOLO EL VIDEO N DE 3 del día. Trabaja en <proyecto>. Lee primero <proyecto>\CLAUDE.md y luego sigue <proyecto>\.motor\RECETA.md para UN solo video:
- Video 1: paso 1 completo (ganadores.py, aprendizajes de hoy) y la noticia/tendencia de HOY.
- Videos 2 y 3: no corren ganadores.py; leen ganadores.md, aprendizajes.md, registro.csv y notas.md para elegir el tema que toca sin repetir el de hoy. Si otra sesión está usando la tarjeta (`nvidia-smi`), esperan (5 min, hasta 45).
- Montar ese video entero, mirarlo en fotogramas, programarlo (primero --probar), limpiar y git push.

Reglas clave:
- SOLO para la PC con Windows: lo PRIMERO es `python -c "import platform; print(platform.system())"`; si no dice Windows, termina diciendo «esta rutina solo corre en la PC».
- Al empezar `git pull --rebase`; al terminar `git add -A`, commit y `git push`.
- Si Instagram o TikTok no están conectados en el panel, para y anótalo en <proyecto>\3 Publicado\notas.md.
- Nunca programes un video que no hayas mirado en fotogramas. Nada sexual ni religioso. Las personas reales solo dicen lo que dijeron. Dos fuentes por historia.
- Si algo falla dos veces, no programes ese video y deja nota.
- No toques nada de Noerion ni de su panel.
- Al terminar, una línea en <proyecto>\3 Publicado\notas.md con fecha, «video N/3», nombre, tema y hora.

Tareas programadas de Claude en la PC con Windows
Cada video va en su propia sesión (decisión de JIS, 25/11/2026), así que son 3 tareas, una por video:

| Tarea | Hora (cron, hora local) | Video |
|---|---|---|
| es_enserio: rutina de las 3 — video 1 | 3:00 (`0 3 * * *`) | quién gana + laboratorio + elegir las 3 del día (`hoy.md`) + hacer la #1 |
| es_enserio: rutina de las 3 — video 2 | 4:15 (`15 4 * * *`) | laboratorio + la #2 de `hoy.md` |
| es_enserio: rutina de las 3 — video 3 | 5:30 (`30 5 * * *`) | laboratorio + la #3 de `hoy.md` |

La hora de subida de cada video ya no es fija: la reparte `laboratorio.py` (3 franjas distintas por día, rotando).
Las 3 viven en la app de Claude de la PC (barra lateral → Programadas; archivos en `C:\Users\Joaquin\.claude\scheduled-tasks\es-enserio-video-N\SKILL.md`).
**Se actualizan solas**: el paso 0 de la RECETA hace que cada corrida compare su texto con este archivo y, si no coincide, lo reescriba con `update_scheduled_task`. Cambia este archivo en GitHub y las tareas lo copian en su próxima corrida.

Texto de cada tarea (igual para las 3; solo cambia N = 1, 2 o 3):

---
Eres el productor de la cuenta es_enserio.tv («¿En serio?»). Esta corrida hace SOLO EL VIDEO N DE 3 del día. Trabaja en la carpeta Titeres (<proyecto>).
1. Lo PRIMERO: `python -c "import platform; print(platform.system())"`. Si no dice Windows, termina diciendo «esta rutina solo corre en la PC».
2. `git pull --rebase` en <proyecto>. Lee <proyecto>\CLAUDE.md entero y sigue <proyecto>\.motor\RECETA.md para UN solo video. Si este texto y la RECETA no coinciden, manda la RECETA (y en su paso 0 se actualiza este texto).
3. ¿Para qué día? `python .motor\laboratorio.py --dia auto --reservar tareaN` → `DIA=… VIDEO=K (reservado)` (el primer día que no tiene sus 3; puede ser mañana o pasado si ya se hicieron con adelanto). Desde aquí usa ESE día y ESE K (RECETA 0b). Cada video es un experimento. ANTES de elegir la historia: `python .motor\laboratorio.py --dia DIA --video K` (lee el panel: qué palanca va ganando, el plan de este video con su BASE y sus PRUEBAS, la hora de hoy y los temas que faltan) y abre los `que-se-hizo.txt` de los ganadores que lista. Copia la forma que gana y haz las pruebas de verdad; nunca un video sin pruebas.
   - Las tareas se ponen en COLA: si los días que vienen ya tienen sus 3 videos (hechos con adelanto), esta corrida hace el de un día más adelante; nunca salen más de 3 por día.
   - Tarea 1: `ganadores.py`, `--guardar`, aprendizajes y estilo.md, si hoy nadie los hizo. Si K = 1 (sea la tarea que sea): busca candidatas en TODOS los temas, elige las 3 mejores de 3 temas distintos, déjalas en `3 Publicado\hoy.md` con su franja de hora y 2 de reserva, push, y monta la #1.
   - Si K = 2 o 3: toman la #2 / #3 de `hoy.md` (si es de su DIA) (o la reserva que no repita tema del día). Si otra sesión usa la tarjeta (`nvidia-smi`), esperan (5 min, hasta 45).
4. Tras `nueva_funcion.py`, `python .motor\laboratorio.py --dia DIA --video K --carpeta "2 Funciones\NNN. Título"` y haz el video siguiendo ese `etiquetas.json` (guion, voz con su ritmo y velocidad, edición, sonido, portada, texto y hora). Al final, `etiquetas.json` dice lo que SE HIZO y `que-se-hizo.txt` va ENTERO, con una línea por prueba.
5. Mírala en fotogramas (todos), prográmala (primero --probar), limpia (`limpiar.py`), una línea en `3 Publicado\notas.md` («video N/3», nombre, tema, hora, pruebas) y `git add -A`, commit y `git push`.
Reglas: NUNCA repetir (`ya_hecho.py` antes de elegir y `--lista` antes del gancho y el cierre). Dos fuentes. La gente real solo dice lo que dijo. Nada sexual ni religioso. Si Instagram o TikTok no están conectados, para y anótalo en notas.md. Si algo falla dos veces, no programes ese video y deja nota. No toques nada de Noerion.
---

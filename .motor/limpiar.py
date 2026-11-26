"""Deja en la carpeta de una función el TEXTO + el VIDEO terminado + la portada (decisión de JIS, 25/11/2026:
cada video se queda en su carpeta para que JIS lo vea antes). Se borra solo lo de trabajo (clips, fotos, voz, plantilla…).
El video y la portada NO van a GitHub (.gitignore); quedan solo en esta compu.
Uso: python .motor/limpiar.py "2 Funciones/NNN. Título" """
import os, shutil, sys
QUEDAN = {'guion.txt', 'que-se-hizo.txt', 'etiquetas.json', 'texto.txt', 'tiempos-qwen.json', 'video.mp4', 'portada.jpg'}
d = sys.argv[1]
if not os.path.exists(os.path.join(d, 'que-se-hizo.txt')): sys.exit('No toco nada: esta carpeta no tiene que-se-hizo.txt')
# el video renderizado sube de salida/ a la carpeta de la función
render = os.path.join(d, 'salida', 'video.mp4')
if os.path.exists(render): shutil.move(render, os.path.join(d, 'video.mp4'))
if not os.path.exists(os.path.join(d, 'video.mp4')): sys.exit('No toco nada: no encuentro el video (salida/video.mp4)')
borrado = 0
for n in os.listdir(d):
    p = os.path.join(d, n)
    if n in QUEDAN: continue
    if os.path.isdir(p): shutil.rmtree(p)
    else: os.remove(p)
    borrado += 1
print(f'listo: quedan {sorted(set(os.listdir(d)))} · borré {borrado} cosas')

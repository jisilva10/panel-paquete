"""Deja en la carpeta de una función SOLO el texto (guion, qué se hizo, etiquetas, texto de la publicación).
El video ya está en el almacén del panel; aquí se borra todo lo pesado para no llenar la compu.
Uso: python .motor/limpiar.py "2 Funciones/NNN. Título" """
import os, shutil, sys
QUEDAN = {'guion.txt', 'que-se-hizo.txt', 'etiquetas.json', 'texto.txt', 'tiempos-qwen.json'}
d = sys.argv[1]
if not os.path.exists(os.path.join(d, 'que-se-hizo.txt')): sys.exit('No toco nada: esta carpeta no tiene que-se-hizo.txt')
borrado = 0
for n in os.listdir(d):
    p = os.path.join(d, n)
    if n in QUEDAN: continue
    if os.path.isdir(p): shutil.rmtree(p)
    else: os.remove(p)
    borrado += 1
print(f'listo: quedan {sorted(set(os.listdir(d)))} · borré {borrado} cosas')

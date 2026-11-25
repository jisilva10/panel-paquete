# El motor

- `voces.py CARPETA qwen|edge` → lee `guion.txt` (QUIEN [emoción]: texto · «...» pausa · *palabra* fuerza) y deja `voz-<motor>.wav` + `tiempos-<motor>.json` (cada palabra con su segundo y la boca por fotograma). **La voz es Qwen** (local, gratis). Los números se leen en palabras.
- `portada.py ESCENA.png "ARRIBA" "ABAJO" salida.jpg [limpio.png]` → portada de una escena, titular en dos placas.
- `fuentes/` tipografías (Bagel Fat One portada, Lilita One subtítulos, Rye letreros) · `sonidos/` y `musica/` (Pixabay, ver CREDITOS.txt).
- `venv/` Python con edge-tts y mlx-audio (Qwen). Los modelos viven en ~/.cache/huggingface.
- `viejo/` lo de las primeras pruebas.

La película de cada función vive en su carpeta (`2 Funciones/AAAA-MM-DD/NN-titulo/`). La base es `laboratorio/prueba-emus-v2/` (mundo de papel, cámara, foto y clip reales, mezcla de sonido).

"""Crea la carpeta de una función con el MISMO nombre que tendrá en el panel:
    2 Funciones/NNN. Título/
Uso: python .motor/nueva_funcion.py "Título de la historia"
Copia la plantilla de la película (.motor/base) y deja guion.txt, que-se-hizo.txt y etiquetas.json listos para llenar.
Imprime la ruta de la carpeta."""
import datetime, json, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUN = os.path.join(RAIZ, '2 Funciones')
BASE = os.path.join(RAIZ, '.motor', 'base')
PL = os.path.join(RAIZ, '.motor', 'plantillas')

def limpio(t):
    # sin signos que Windows no deja en carpetas ni signos de pregunta/exclamación de apertura
    t = re.sub(r'[\\/:*?"<>|¿¡!]', '', t).strip().rstrip('.')
    return re.sub(r'\s+', ' ', t)[:60]

def siguiente():
    nums = [int(m.group(1)) for n in os.listdir(FUN) if (m := re.match(r'^(\d{3})\. ', n))]
    reg = os.path.join(RAIZ, '3 Publicado', 'registro.csv')
    if os.path.exists(reg):
        for l in open(reg, encoding='utf8'):
            m = re.search(r',(\d{3})\. ', ',' + l)
            if m: nums.append(int(m.group(1)))
    return max(nums, default=0) + 1

def main():
    if len(sys.argv) < 2: sys.exit('Uso: nueva_funcion.py "Título"')
    titulo = limpio(' '.join(sys.argv[1:]))
    num = f'{siguiente():03d}'
    nombre = f'{num}. {titulo}'
    dest = os.path.join(FUN, nombre)
    os.makedirs(dest)
    for f in ('plantilla.html', 'construir.py', 'hyperframes.json'):
        shutil.copy(os.path.join(BASE, f), dest)
    for d in ('vendor', 'fuentes'):
        shutil.copytree(os.path.join(BASE, d), os.path.join(dest, d))
    for d in ('fotos', 'clips', 'material', 'salida'):
        os.makedirs(os.path.join(dest, d), exist_ok=True)
    hoy = datetime.date.today().isoformat()
    for f in ('guion.txt', 'que-se-hizo.txt'):
        t = open(os.path.join(PL, f), encoding='utf8').read()
        t = t.replace('{{NOMBRE}}', nombre).replace('{{NUM}}', num).replace('{{TITULO}}', titulo).replace('{{FECHA}}', hoy)
        open(os.path.join(dest, f), 'w', encoding='utf8').write(t)
    json.dump({'tipo': '', 'duracion': '', 'gancho': '', 'cierre': '', 'narrador': '', 'voz': 'qwen', 'edicion': '', 'novedad': ''},
              open(os.path.join(dest, 'etiquetas.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print(dest)

main()

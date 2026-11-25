"""Portada: un fotograma de la escena + titular en dos placas (acento arriba, negra abajo)."""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
esc, arriba, abajo, salida = sys.argv[1:5]
limpio = sys.argv[5] if len(sys.argv) > 5 else None
import os
F = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fuentes', 'BagelFatOne-Regular.ttf')
im = Image.open(esc).convert('RGB').resize((1080,1920))
if limpio:  # el mostrador sin subtítulos, de un fotograma donde no hay
    im.paste(Image.open(limpio).convert('RGB').resize((1080,1920)).crop((0,1250,1080,1920)), (0,1250))
# recorta al escenario y lo agranda un poco: la portada de 3:4 de IG ve el centro
d = ImageDraw.Draw(im)
def placa(txt, y, fondo, color, tam, rot):
    f = ImageFont.truetype(F, tam)
    while d.textlength(txt, font=f) > 860: tam -= 4; f = ImageFont.truetype(F, tam)
    w = d.textlength(txt, font=f)
    capa = Image.new('RGBA', (int(w)+120, tam+90), (0,0,0,0)); c = ImageDraw.Draw(capa)
    c.rounded_rectangle([10,10,capa.width-10,capa.height-10], 26, fill=fondo, outline='#fff8ea', width=10)
    bb = c.textbbox((0,0), txt, font=f); c.text((60 - bb[0], (capa.height - (bb[3]-bb[1]))//2 - bb[1]), txt, font=f, fill=color)
    capa = capa.rotate(rot, expand=True, resample=Image.BICUBIC)
    sombra = Image.new('RGBA', capa.size, (20,8,20,0)); sombra.putalpha(capa.split()[3].point(lambda a: a*0.5))
    sombra = sombra.filter(ImageFilter.GaussianBlur(14))
    x = (1080 - capa.width)//2
    im.paste(sombra, (x+12, y+18), sombra); im.paste(capa, (x, y), capa)
    return y + capa.height
fin = placa(arriba, 1265, '#ffd23f', '#2b1e2e', 96, 3)
placa(abajo, fin - 30, '#2b1e2e', '#fff8ea', 120, -2)
im.save(salida, quality=92); print(salida)

"""Arma una vista de prueba (solo modo demo) para publicar como Artifact de Claude.

Uso: python3 scripts/vista-previa.py <carpeta-destino>
El visor envuelve la página en su propio <html>/<head>/<body>, así que se
quitan esas etiquetas, y se marca window.MG_PREVIEW para desactivar la conexión.
"""
import pathlib, re, shutil, sys

root = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
for name in ['app.js', 'api.js', 'insights.js', 'receipt.js', 'styles.css', 'icon.svg']:
    shutil.copy(root / 'web' / name, out / name)

html = (root / 'web' / 'index.html').read_text()
head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
keep = [l for l in head.splitlines()
        if re.search(r'<title>|fonts\.g|styles\.css', l)]
page = '\n'.join(keep) + '\n<script>window.MG_PREVIEW = true;</script>\n' + body
(out / 'index.html').write_text(page)
print('Vista previa en', out)

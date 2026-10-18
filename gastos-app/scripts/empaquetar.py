"""Genera instalador/mis-gastos-web.zip (para arrastrar a Netlify Drop) e instalador/Code.gs."""
import pathlib, shutil, zipfile

root = pathlib.Path(__file__).resolve().parent.parent
out = root / 'instalador'
out.mkdir(exist_ok=True)
with zipfile.ZipFile(out / 'mis-gastos-web.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted((root / 'web').iterdir()):
        if f.is_file():
            z.write(f, f.name)
shutil.copy(root / 'apps-script' / 'Code.gs', out / 'Code.gs')
print('Listo:', *(p.name for p in sorted(out.iterdir())))

# 💜 Mis Gastos

App web (PWA, se instala en el celular como una app) para administrar gastos personales, conectada a **Google Sheets**.

- Categorías: Comida, Transporte, Salud, Deporte, Ropa, Maquillaje, Social, Suscripciones y Ahorros — y se pueden **agregar, editar o archivar** más.
- **Tope mensual** general + **meta mensual por categoría**.
- 📷 **Foto del voucher**: se comprime en el celular, se guarda en Google Drive (carpeta *Mis Gastos - Vouchers*) y el link queda en la hoja.
- ✨ **Lectura automática del voucher**: al tomar la foto, la app lee el **monto total, la fecha y el comercio** y completa el formulario (solo los campos vacíos; siempre se puede corregir). El reconocimiento corre en el propio celular con [Tesseract.js](https://tesseract.projectnaptha.com/), sin costo; la primera vez descarga ~4 MB del modelo en español.
- **Tablero**: % del tope usado, proyección a fin de mes, cuánto puedes gastar por día, progreso por categoría, distribución y tendencia de 6 meses.
- **Excesos y alertas**: categorías excedidas, en riesgo (por el ritmo de gasto) y tope superado.
- **Recomendaciones**: si te excedes en una categoría, la app reparte ese exceso entre las categorías que aún tienen holgura y te dice cuánto recortar en cada una (nunca en categorías marcadas como 🛡️ *protegidas*, p. ej. Salud o Ahorros). También avisa si una meta se excede seguido, si tus metas suman más que el tope, cuánto te falta para la meta de ahorro y qué categoría subió más vs tus últimos 3 meses.
- Diseño suave/pastel con modo oscuro automático.

Sin conectar, la app funciona en **modo demo** con datos de ejemplo guardados en el navegador.

## Estructura

```
gastos-app/
├── apps-script/   Backend: se pega en la Google Sheet (Apps Script)
│   ├── Code.gs
│   └── appsscript.json
├── web/           La app (HTML/CSS/JS sin dependencias ni build)
└── tests/         Tests del motor de recomendaciones y del lector de vouchers
```

## 1. Preparar la Google Sheet (5 minutos)

1. Crea una Google Sheet nueva (p. ej. "Mis Gastos").
2. Menú **Extensiones → Apps Script**.
3. Borra el contenido de `Código.gs` y pega todo [`apps-script/Code.gs`](apps-script/Code.gs). Guarda.
4. (Opcional) En ⚙️ *Configuración del proyecto* activa "Mostrar archivo de manifiesto" y pega [`appsscript.json`](apps-script/appsscript.json) (ajusta `timeZone` si no estás en Lima).
5. Arriba elige la función **`setup`** y pulsa **Ejecutar**. Acepta los permisos (Sheets y Drive).
   Se crean las hojas **Gastos**, **Categorias**, **Config** y **Resumen** (con fórmulas del mes).
6. Abre **Registros de ejecución** y copia el **token** que aparece. (Si lo pierdes, ejecuta `verToken`.)
7. **Implementar → Nueva implementación → Tipo: Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
   - Copia la **URL** que termina en `/exec`.

> El token impide que otras personas lean o escriban en la hoja aunque conozcan la URL. No lo compartas.
> Si cambias `Code.gs` después, usa **Implementar → Administrar implementaciones → Editar → Nueva versión** para que la URL siga siendo la misma.

## 2. Publicar la app

La carpeta `web/` es estática. Opciones gratuitas: **GitHub Pages**, **Netlify Drop** (arrastrar la carpeta `web/` en app.netlify.com/drop) o **Vercel**. Se necesita HTTPS para la cámara y para instalarla como app.

En el celular abre la URL → menú del navegador → **"Agregar a pantalla de inicio"**.

## 3. Conectar

En la app: **Ajustes → Conexión con Google Sheets** → pega la URL `/exec` y el token → **Conectar**.
Luego en **Metas** define el tope mensual y la meta de cada categoría.

## La hoja de cálculo

| Hoja | Contenido |
|------|-----------|
| **Gastos** | ID, Fecha, Monto, Categoría, Descripción, Método de pago, Voucher (link a Drive), Creado |
| **Categorias** | Nombre, Emoji, Color, Presupuesto mensual, Tipo (`gasto`/`ahorro`), Activa, Protegida |
| **Config** | `tope_mensual`, `moneda`, `nombre` |
| **Resumen** | Presupuesto vs gastado del mes (cambia la fecha en B1 para ver otro mes) |

Se puede editar la hoja directamente (agregar gastos a mano, cambiar metas); la app lo verá al recargar.
Las categorías archivadas no se borran, para no perder el historial.

## Desarrollo

```bash
npm start   # sirve web/ en http://localhost:5173
npm test    # tests del análisis y del lector de vouchers (Node 18+)
```

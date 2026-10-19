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
├── instalador/    Paquete listo: zip de la web + Code.gs (npm run empaquetar)
├── web/           La app (HTML/CSS/JS sin dependencias ni build)
└── tests/         Tests del motor de recomendaciones y del lector de vouchers
```

## Instalación

El manual para usuarias (paso a paso, con iPhone) está aparte; esto es el resumen técnico.

**Una sola vez, quien administra:**
1. `npm run empaquetar` → genera `instalador/mis-gastos-web.zip` e `instalador/Code.gs`.
2. Arrastra el zip a [app.netlify.com/drop](https://app.netlify.com/drop) (con cuenta gratis, para que no se borre). Netlify da la dirección, p. ej. `https://mis-gastos.netlify.app/`. Sirve cualquier hosting estático con HTTPS.
3. Escribe esa dirección en `APP_URL` al inicio de `instalador/Code.gs` y comparte ese archivo.

**Cada persona (tiene su propia hoja y sus datos):**
1. Google Sheet nueva → **Extensiones → Apps Script** → pega `Code.gs` → guarda → elige la función `setup` → **Ejecutar** (acepta permisos). Crea las hojas y el token.
2. Recarga la hoja: aparece el menú **💜 Mis Gastos**.
3. Apps Script: **Implementar → Nueva implementación → Aplicación web** (Ejecutar como: Yo · Acceso: Cualquier usuario).
4. En la hoja: **💜 Mis Gastos → 2. Conectar mi celular (QR)** → pega la URL `/exec` → escanea el QR con el celular.
   El enlace (`APP_URL#conectar=<exec>&token=<token>`) configura la app y se borra de la barra de direcciones.
5. iPhone: Safari → Compartir → **Agregar a inicio**. Android: Chrome → **Instalar app**.

> El token impide que otras personas usen la hoja aunque conozcan la URL. El QR y el enlace lo contienen: no se comparten.
> Si cambias `Code.gs` después: **Implementar → Administrar implementaciones → Editar → Nueva versión** (la URL se mantiene).

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
npm run empaquetar  # regenera instalador/
npm test    # tests del análisis y del lector de vouchers (Node 18+)
```

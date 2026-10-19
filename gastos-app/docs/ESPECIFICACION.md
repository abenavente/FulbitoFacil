# Mis Gastos — Especificación para recrear la app

Documento de referencia con todo lo construido: diseño, pantallas, funciones, datos, lógica de recomendaciones, conexión con Google Sheets y lecciones aprendidas. Sirve para rehacer la app en otro proyecto o pedírsela a una IA de código copiando este archivo y la carpeta `capturas/`.

---

## 1. Qué es

App web instalable en el celular (PWA) para **administrar gastos personales**, conectada al **Google Sheet** de cada persona.

- Registrar gastos por categoría, con **foto del voucher** que se guarda en Google Drive.
- **Lectura automática del voucher** (OCR en el celular): completa monto total, fecha y comercio.
- **Tope mensual** general y **meta mensual por categoría**.
- **Tablero** del mes: % del tope, proyección, gasto diario permitido, avance por categoría, distribución y tendencia de 6 meses.
- **Alertas** de excesos y **recomendaciones** de en qué categorías ajustar para compensar.
- Categorías personalizables. Funciona para varias personas: cada una con su propia hoja.
- Sin conexión configurada funciona en **modo demo** con datos de ejemplo.

Público: una persona (no técnica) que usa iPhone. Idioma: español (Perú), moneda por defecto `S/`.

---

## 2. Arquitectura

```
iPhone / navegador (PWA estática en Netlify)
        │   GET JSONP  ?p=<json>&callback=<fn>     (lecturas y escrituras)
        │   POST no-cors                            (foto completa)
        ▼
Google Apps Script (Aplicación web, ligado al Google Sheet)
        │
        ├── Google Sheet: hojas Gastos · Categorias · Config · Resumen
        └── Google Drive: carpeta "Mis Gastos - Vouchers"
```

| Parte | Tecnología | Notas |
|---|---|---|
| Frontend | HTML + CSS + JavaScript (módulos ES), **sin build ni frameworks** | Archivos: `index.html`, `styles.css`, `app.js`, `api.js`, `insights.js`, `receipt.js`, `sw.js`, `manifest.webmanifest`, íconos |
| Backend | Google Apps Script (un solo `Code.gs`) | Se pega en Extensiones → Apps Script del Sheet; se publica como Aplicación web (Ejecutar como: Yo · Acceso: Cualquier usuario) |
| Datos | Google Sheets | Cada persona su hoja; editable a mano |
| Fotos | Google Drive | Enlace "cualquiera con el enlace puede ver" guardado en la hoja |
| OCR | Tesseract.js 5.1.1 (cdn.jsdelivr), idioma `spa` | Se carga solo al tomar la primera foto (~4 MB) |
| Hosting | Netlify Drop (zip arrastrado) | Cualquier hosting estático con HTTPS sirve |
| Seguridad | Token aleatorio (20 caracteres) en Script Properties | Toda petición lo lleva; sin token responde "Token inválido" |

Estructura del proyecto:

```
gastos-app/
├── apps-script/Code.gs        Backend completo (incluye el diálogo del QR)
├── apps-script/appsscript.json
├── web/                       La app
├── tests/                     node --test (análisis y lector de vouchers)
├── scripts/empaquetar.py      Genera instalador/ (zip para Netlify + Code.gs/.txt)
└── scripts/vista-previa.py    Versión solo-demo para publicar como vista de prueba
```

---

## 3. Diseño

### 3.1 Dirección visual

Suave, pastel y "aesthetic": fondo lila muy claro con dos manchas difusas (rosa y lavanda), tarjetas de vidrio esmerilado (blanco translúcido + `backdrop-filter: blur`), esquinas muy redondeadas, títulos con serif elegante y números grandes. Modo oscuro automático con la misma paleta en tonos ciruela.

### 3.2 Tokens de color

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#F7F1FB` | `#17141F` | Fondo de página |
| `--surface` | `rgba(255,255,255,.72)` | `rgba(37,31,50,.78)` | Tarjetas (vidrio) |
| `--surface-solid` | `#FFFFFF` | `#241E30` | Hojas modales, inputs |
| `--border` | `rgba(120,90,160,.12)` | `rgba(220,200,255,.10)` | Bordes |
| `--text` | `#2B2238` | `#F2ECFA` | Texto |
| `--muted` | `#7C7090` | `#A99BBF` | Texto secundario |
| `--primary` | `#9B7BD4` | `#B79BEA` | Lila principal |
| `--primary-2` | `#F2A7C3` | `#F2A7C3` | Rosa (degradados) |
| `--ok` | `#5DBB97` | — | Ahorro / éxito |
| `--warn` | `#E9A23B` | — | En riesgo |
| `--danger` | `#E06C88` | — | Excedido |
| `--track` | `rgba(155,123,212,.14)` | `rgba(183,155,234,.16)` | Fondos de barras y botones suaves |
| `--blob-a` / `--blob-b` | `#F9D5E5` / `#D9CCF5` | `#4A2A44` / `#2E2950` | Manchas de fondo (blur 60px) |
| `--radius` | `22px` | | Radio de tarjetas |
| `--shadow` | `0 10px 30px rgba(110,80,150,.10)` | `0 10px 30px rgba(0,0,0,.35)` | Sombra |

Patrón de tema: todos los tokens en `:root`; redefinidos en `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }` y en `:root[data-theme="dark"]`.

Colores de categorías por defecto: Comida `#F4A261`, Transporte `#7FB7BE`, Salud `#E07A9A`, Deporte `#8CC084`, Ropa `#B39CD0`, Maquillaje `#F28FAD`, Social `#F6BD60`, Suscripciones `#84A9E8`, Ahorros `#6CC4A1`.

### 3.3 Tipografía

- **Fraunces** 600 (Google Fonts): títulos de pantalla (30px), monto grande del tablero (32px), monto del formulario (44px), títulos de hojas modales.
- **Plus Jakarta Sans** 400–700: todo lo demás (14–15px cuerpo, 11–13px etiquetas).

### 3.4 Componentes

| Componente | Descripción |
|---|---|
| Encabezado | Saludo pequeño ("Hola, Brunela ✨") + título serif + selector de mes en píldora (‹ Oct. 26 ›) |
| Banner | Aviso de modo demo, degradado amarillo→rosa |
| Tarjeta héroe | Degradado lila→rosa; anillo SVG de progreso (r=52, trazo 11, color cambia a ámbar >85% y rojo >100%), monto gastado, tope y dos chips ("Quedan S/ X", "S/ X/día · N días") |
| Stats | Dos tarjetas: proyección fin de mes (roja si supera el tope) y ahorrado con mini barra verde |
| Alerta | Fila con punto de color con halo (rojo/ámbar), título, detalle y monto "+S/ X" |
| Recomendación | Ícono en cuadro redondeado + título + texto; la de compensación lista recortes por categoría con su "nuevo límite" |
| Fila de categoría | Emoji en cuadro con color de la categoría (22% opacidad), nombre + insignia (EXCEDIDO / EN RIESGO / 80%+ / META ✓), "S/ gastado de S/ meta · quedan/exceso", barra de progreso con marca de proyección, % a la derecha |
| Dona | SVG con `stroke-dasharray` por categoría + leyenda con % |
| Tendencia | Barras de 6 meses con degradado; barra roja si superó el tope; línea punteada "tope"; mes actual resaltado |
| Barra inferior | Flotante, vidrio, 5 columnas: Inicio · Gastos · **+** (botón degradado elevado) · Metas · Ajustes |
| Hoja modal | `<dialog>` que sube desde abajo (bordes 28px arriba), manija, fondo con blur |
| Chips de categoría | Píldoras con borde; la activa se rellena con su color |
| Zona de foto | Recuadro punteado lila; muestra la foto completa (`object-fit: contain`) |
| Aviso de presupuesto | Bajo el formulario: "Te quedarán S/ X en Salud" o en rojo "Con este gasto te excedes…" |
| Toast | Píldora oscura abajo al centro, 2,6 s |
| Confirmación | Hoja modal propia (no `confirm()` del navegador) |

### 3.5 Layout

Mobile-first, ancho máximo 560px centrado, margen lateral 16px, respeta `safe-area-inset`. En pantallas ≤380px el héroe y la dona se apilan.

---

## 4. Pantallas

### Inicio (tablero)

![Inicio](capturas/01-inicio.png)

Modo oscuro:

![Inicio oscuro](capturas/02-inicio-oscuro.png)

### Gastos

Lista del mes agrupada por día con total diario, filtros por categoría, enlace al voucher y "Eliminar".

![Gastos](capturas/03-gastos.png)

### Nuevo gasto (botón +)

Monto grande, chips de categoría, fecha, método de pago (Tarjeta, Efectivo, Yape/Plin, Transferencia), descripción, foto del voucher. Al tomar la foto, el OCR completa los campos vacíos.

![Nuevo gasto](capturas/04-nuevo-gasto.png)

![Voucher leído](capturas/04b-nuevo-gasto-voucher.png)

### Metas

Tope mensual (muestra suma de metas y margen libre) y lista de categorías.

![Metas](capturas/05-metas.png)

### Editar categoría

Emoji, color, nombre, meta mensual, tipo (Gasto / Ahorro), "Protegida" y Archivar/Reactivar.

![Editar categoría](capturas/06-editar-categoria.png)

### Ajustes

Conexión (enlace completo o URL /exec + token), nombre, moneda, reinicio de demo.

![Ajustes](capturas/07-ajustes.png)

### Confirmación

![Confirmar](capturas/08-confirmar-eliminar.png)

---

## 5. Funciones

1. **Registrar gasto**: monto > 0, categoría, fecha `YYYY-MM-DD`, pago, descripción, foto opcional. La app genera el `id` (para que un reintento no duplique).
2. **Foto del voucher**: se reduce a 1200px de lado mayor, JPEG calidad 0,7; se sube a Drive; el enlace queda en la columna Voucher.
3. **Lectura automática** (ver §8): llena monto, fecha y comercio solo si el campo está vacío y muestra "✨ Detectado: … Revisa que esté bien".
4. **Aviso en vivo** al escribir el monto: cuánto quedará en la categoría, si se excede o si supera el tope.
5. **Eliminar gasto** con confirmación.
6. **Categorías**: crear, editar (renombrar actualiza los gastos), archivar (no borra historial), reactivar. Tipo *gasto* (cuenta para el tope) o *ahorro* (meta a alcanzar). *Protegida* = nunca se recomienda recortarla.
7. **Tope mensual** y moneda/nombre en Config.
8. **Navegar meses** con ‹ ›; tocar una categoría del tablero abre sus gastos filtrados.
9. **Modo demo** con datos de ejemplo (mes actual + 5 meses anteriores) en `localStorage`.
10. **Conexión por QR o enlace**: `APP_URL#conectar=<url exec>&token=<token>`; la app prueba, guarda y borra el token de la barra de direcciones. También acepta pegar ese enlace completo en Ajustes.
11. **PWA**: manifest, íconos PNG (180/192/512), service worker red-primero para el "cascarón".

---

## 6. Datos (Google Sheet)

| Hoja | Columnas |
|---|---|
| **Gastos** | ID · Fecha · Monto · Categoría · Descripción · Método de pago · Voucher · Creado |
| **Categorias** | Nombre · Emoji · Color · Presupuesto mensual · Tipo (`gasto`/`ahorro`) · Activa · Protegida |
| **Config** | Clave · Valor (`tope_mensual`, `moneda`, `nombre`) |
| **Resumen** | Fórmulas del mes (fecha en B1): presupuesto, gastado (SUMIFS), disponible, % usado, estado |

Categorías iniciales (meta S/): Comida 800, Transporte 300, Salud 250 (protegida), Deporte 150, Ropa 250, Maquillaje 150, Social 300, Suscripciones 100, Ahorros 500 (ahorro, protegida). Tope inicial 2500.

---

## 7. Lógica del tablero y recomendaciones (`insights.js`, funciones puras)

Entrada: `{config, categories, expenses}`, mes `YYYY-MM`, fecha de hoy.

**Por categoría**
- `spent` = suma del mes; `projected` = `spent × díasDelMes / díasTranscurridos` (solo mes en curso, tipo gasto, y **no** para Suscripciones).
- Estado:
  - ahorro → `goal` si `spent ≥ meta`, si no `saving`.
  - `exceeded` si `spent > meta`.
  - `risk` si mes en curso, `projected > meta × 1,05` y quedan > 2 días.
  - `warning` si `spent ≥ 80%` de la meta.
- Gastos en categorías inexistentes se muestran igual (sin meta → excedidos).

**Totales**: gastado (solo tipo gasto), proyección, suma de metas, ahorrado, meta de ahorro, disponible = tope − gastado, **por día** = disponible / días restantes (incluye hoy).

**Alertas**: tope superado; "a este ritmo superarás tu tope"; cada categoría excedida (+exceso); cada categoría en riesgo (+proyección − meta).

**Recomendaciones** (en este orden):
1. **Compensar exceso**: exceso total de categorías excedidas se reparte entre "donantes" = categorías tipo gasto, no protegidas, no excedidas, con meta, cuya holgura `meta − max(gastado, proyección)` > 0, **proporcional a su holgura**. Lista "−S/ X · nuevo límite S/ Y". Si no alcanza, muestra lo no cubierto.
2. **Revisar meta**: categoría excedida que también se excedió en ≥ 2 de los 3 meses anteriores.
3. **Frena en X**: para categorías en riesgo, máximo por día = (meta − gastado) / días restantes.
4. **Puedes gastar S/ X al día** (mes en curso con saldo).
5. **Metas > tope**: si la suma de metas supera el tope.
6. **Ahorro pendiente**: lo que falta para la meta de ahorro y cuánto sobraría del tope.
7. **Tendencia**: la categoría que más subió (> 25%) vs el promedio de los 3 meses anteriores.
8. Si no hay nada: "¡Vas excelente!".

---

## 8. Lector de vouchers (`receipt.js`)

- `parseAmount`: entiende `45.90`, `45,90`, `1,234.50`, `1.234,50`, `S/ 1,250`.
- **Monto**: líneas con "total / a pagar / importe", excluyendo subtotal, descuento, vuelto, cambio, gravada, IGV, "op."; prioridad a "total a pagar / importe total / total pagado / monto total"; si la línea no tiene número, mira la siguiente. Sin "total" → el mayor monto con 2 decimales.
- **Fecha**: `dd/mm/aaaa`, `dd-mm-aa` o `aaaa-mm-dd`, válida y no más de 1 día en el futuro.
- **Comercio**: primera línea con ≥ 4 letras y mayoría de letras, sin RUC/boleta/factura/fecha/ticket/electrónica (máx. 40 caracteres).

---

## 9. API del backend (Apps Script)

Todas las acciones llevan `token`. Respuesta `{ok, data}` o `{ok:false, error, code?}`.

| Acción | Parámetros | Resultado |
|---|---|---|
| `ping` | — | `{pong, sheet}` |
| `getAll` | — | `{config, categories, expenses}` |
| `addExpense` | `expense{id,amount,category,date,description,payment}`, `photo{uploadId,mimeType,name}` | gasto guardado (idempotente por `id`) |
| `deleteExpense` | `id` | `{id}` |
| `saveCategory` | `category`, `originalName?` | lista de categorías |
| `deleteCategory` | `name` | archiva; lista de categorías |
| `saveConfig` | `config{}` | config |
| `stashUpload` | `uploadId`, `data` (completa) o `index`,`total`,`data` (parte) | guarda en CacheService 6 h |

**Transporte (importante para Safari)**
- Lecturas/escrituras: `GET <exec>?p=<JSON>&callback=<fn>` → `fn({...});` con MIME JavaScript (**JSONP** con `<script>`).
- Foto: `POST` `mode:'no-cors'` con `stashUpload` (foto completa), luego `addExpense` por JSONP. Si responde `code: 'UPLOAD_MISSING'`, la app sube la foto en partes de 3500 caracteres por JSONP (4 en paralelo) y repite `addExpense`.
- Caché: valores ≤ 90 000 caracteres por clave (`up_<id>_<i>`, `up_<id>_n`).

**Menú en la hoja** (`onOpen`): "💜 Mis Gastos → 1. Instalar / reparar hojas" y "2. Conectar mi celular (QR)": diálogo que pide dirección de la app y URL /exec, genera el QR en el navegador (qrcodejs 1.0.0) y ofrece "Enviarme el enlace por correo".

---

## 10. Lecciones aprendidas

| Problema | Causa | Solución |
|---|---|---|
| "Load failed" en Safari al conectar | Safari no deja leer con `fetch()` la respuesta de Apps Script tras su redirección | JSONP por `<script>` + POST no-cors para fotos con confirmación |
| "No se pudo abrir el archivo en este momento" | URL de una implementación vieja o varias cuentas de Google abiertas | Nueva implementación, copiar la **URL** (no el ID), probar en ventana privada |
| El cambio de código no se nota | Apps Script sirve la última **versión** publicada | Implementar → Administrar → ✏️ → **Nueva versión** |
| Probar que la URL funciona | — | Abrir `<exec>?callback=prueba` → debe mostrar `prueba({"ok":false,"error":"Token inválido…"});` |
| App instalada en iPhone en modo demo | La app de la pantalla de inicio no comparte almacenamiento con Safari | Pegar el enlace completo en Ajustes |
| `confirm()` no funciona en algunos visores | Restricción del visor | Diálogo propio |
| Ícono en iPhone | iOS no usa SVG para `apple-touch-icon` | PNG 180×180 |

---

## 11. Prompt para recrearla con una IA de código

> Construye una PWA en español llamada "Mis Gastos" para administrar gastos personales, sin frameworks ni build (HTML, CSS y JS con módulos ES), con backend en Google Apps Script ligado a un Google Sheet. Sigue exactamente la especificación de `ESPECIFICACION.md` (diseño y tokens de la sección 3, pantallas de la sección 4 con las capturas de `capturas/`, funciones de la 5, hojas de la 6, lógica de la 7, lector de vouchers de la 8 y API/transporte JSONP de la 9). Incluye modo demo, tests con `node --test` para la lógica de análisis y del lector, y un script que empaquete la carpeta web en un zip para Netlify.

/**
 * Mis Gastos — backend en Google Apps Script.
 *
 * Se pega en el editor de Apps Script de la Google Sheet (Extensiones > Apps Script).
 * 1. Ejecuta `setup()` una vez (o menú Mis Gastos > Instalar): crea las hojas,
 *    las categorías base y el token de acceso.
 * 2. Implementar > Nueva implementación > Aplicación web
 *    (Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario).
 * 3. Menú Mis Gastos > Conectar mi celular: muestra un QR que abre la app ya conectada.
 */

// Dirección donde está publicada la app. Quien administra la app la escribe aquí
// una vez antes de compartir este código; cada persona también puede cambiarla en el diálogo.
var APP_URL = 'https://TU-APP.netlify.app/';

var SHEETS = {
  GASTOS: 'Gastos',
  CATEGORIAS: 'Categorias',
  CONFIG: 'Config',
  RESUMEN: 'Resumen'
};

var GASTOS_HEADERS = ['ID', 'Fecha', 'Monto', 'Categoría', 'Descripción', 'Método de pago', 'Voucher', 'Creado'];
var CATEGORIAS_HEADERS = ['Nombre', 'Emoji', 'Color', 'Presupuesto mensual', 'Tipo', 'Activa', 'Protegida'];

var DEFAULT_CATEGORIES = [
  ['Comida', '🍜', '#F4A261', 800, 'gasto', true, false],
  ['Transporte', '🚌', '#7FB7BE', 300, 'gasto', true, false],
  ['Salud', '💊', '#E07A9A', 250, 'gasto', true, true],
  ['Deporte', '🏃‍♀️', '#8CC084', 150, 'gasto', true, false],
  ['Ropa', '👗', '#B39CD0', 250, 'gasto', true, false],
  ['Maquillaje', '💄', '#F28FAD', 150, 'gasto', true, false],
  ['Social', '🥂', '#F6BD60', 300, 'gasto', true, false],
  ['Suscripciones', '📺', '#84A9E8', 100, 'gasto', true, false],
  ['Ahorros', '🐷', '#6CC4A1', 500, 'ahorro', true, true]
];

var DEFAULT_CONFIG = [
  ['tope_mensual', 2500],
  ['moneda', 'S/'],
  ['nombre', '']
];

var VOUCHER_FOLDER = 'Mis Gastos - Vouchers';

/* ---------- Menú en la hoja ---------- */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('💜 Mis Gastos')
    .addItem('1. Instalar / reparar hojas', 'menuInstalar')
    .addItem('2. Conectar mi celular (QR)', 'menuConectar')
    .addToUi();
}

function menuInstalar() {
  setup();
  SpreadsheetApp.getUi().alert('Mis Gastos',
    'Listo: hojas y categorías creadas.\n\nSiguiente paso: Implementar > Nueva implementación > Aplicación web ' +
    '(Ejecutar como: Yo · Acceso: Cualquier usuario). Luego usa "2. Conectar mi celular".',
    SpreadsheetApp.getUi().ButtonSet.OK);
}

function menuConectar() {
  var html = HtmlService.createHtmlOutput(CONECTAR_HTML).setWidth(460).setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'Conectar mi celular');
}

/** Datos para el diálogo: URLs guardadas (o detectadas) y token. */
function datosConexion() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('API_TOKEN') || setup();
  var detected = '';
  try { detected = ScriptApp.getService().getUrl() || ''; } catch (e) { /* aún no implementado */ }
  return {
    appUrl: props.getProperty('APP_URL') || APP_URL,
    execUrl: props.getProperty('WEBAPP_URL') || (/\/exec$/.test(detected) ? detected : ''),
    token: token
  };
}

/** Guarda las URLs y devuelve el enlace que conecta la app automáticamente. */
function generarEnlace(appUrl, execUrl) {
  appUrl = String(appUrl || '').trim();
  execUrl = String(execUrl || '').trim();
  if (!/^https:\/\//.test(appUrl) || /TU-APP/.test(appUrl)) throw new Error('Escribe la dirección de la app (https://…).');
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(execUrl)) throw new Error('La URL de la aplicación web debe terminar en /exec.');
  var props = PropertiesService.getScriptProperties();
  props.setProperty('APP_URL', appUrl);
  props.setProperty('WEBAPP_URL', execUrl);
  var token = props.getProperty('API_TOKEN') || setup();
  return appUrl.replace(/#.*$/, '') + '#conectar=' + encodeURIComponent(execUrl) + '&token=' + encodeURIComponent(token);
}

function enviarEnlacePorCorreo(link) {
  var email = Session.getEffectiveUser().getEmail();
  MailApp.sendEmail({
    to: email,
    subject: 'Tu enlace de Mis Gastos',
    htmlBody: '<p>Abre este enlace <b>en tu celular</b> (en iPhone, con Safari) para conectar la app con tu Google Sheet:</p>' +
      '<p><a href="' + link + '">Conectar Mis Gastos</a></p>' +
      '<p>Si ya instalaste la app en tu pantalla de inicio y aparece en modo demo, copia este enlace completo y pégalo en Ajustes:</p>' +
      '<p style="font-family:monospace;font-size:12px;word-break:break-all">' + link + '</p>' +
      '<p>No compartas este enlace: da acceso a tus gastos.</p>'
  });
  return email;
}

// Diálogo del QR. El QR se genera en el navegador: el token no sale de tu computadora.
var CONECTAR_HTML = `<!doctype html>
<html>
<head>
  <base target="_top">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
  <style>
    body { font-family: Arial, sans-serif; color: #2B2238; margin: 0; padding: 4px 6px; font-size: 14px; }
    label { display: block; font-weight: bold; margin: 12px 0 4px; font-size: 13px; }
    input { width: 100%; box-sizing: border-box; padding: 8px; border: 1px solid #cbbfe0; border-radius: 8px; font-size: 13px; }
    .help { color: #7C7090; font-size: 12px; margin: 4px 0 0; }
    button { background: #9B7BD4; color: #fff; border: 0; border-radius: 10px; padding: 10px 14px; font-weight: bold; cursor: pointer; margin-top: 14px; }
    button.ghost { background: #EFE7FB; color: #2B2238; }
    #qr { display: flex; justify-content: center; margin: 16px 0 8px; }
    #result { display: none; text-align: center; }
    .err { color: #C0395A; margin-top: 10px; }
    .ok { color: #2E8B6A; }
  </style>
</head>
<body>
  <div id="form">
    <label for="app">Dirección de la app</label>
    <input id="app" placeholder="https://mis-gastos.netlify.app/">
    <p class="help">Te la da quien administra la app.</p>
    <label for="exec">URL de la aplicación web (termina en /exec)</label>
    <input id="exec" placeholder="https://script.google.com/macros/s/…/exec">
    <p class="help">Implementar &gt; Administrar implementaciones &gt; copia la URL.</p>
    <button id="go">Generar código QR</button>
    <p class="err" id="err"></p>
  </div>
  <div id="result">
    <p><b>Escanea este código con la cámara de tu celular</b></p>
    <div id="qr"></div>
    <p class="help">Se abrirá la app ya conectada. En iPhone ábrelo con Safari y luego: Compartir &gt; Agregar a inicio.</p>
    <button id="mail" class="ghost">Enviarme el enlace por correo</button>
    <button id="copy" class="ghost">Copiar enlace</button>
    <p class="help" id="msg"></p>
    <p class="help"><b>No compartas este código:</b> da acceso a tus gastos.</p>
  </div>
  <script>
    var link = '';
    var $ = function (id) { return document.getElementById(id); };
    google.script.run.withSuccessHandler(function (d) {
      $('app').value = /TU-APP/.test(d.appUrl) ? '' : d.appUrl;
      $('exec').value = d.execUrl;
    }).datosConexion();
    $('go').onclick = function () {
      $('err').textContent = '';
      google.script.run
        .withSuccessHandler(function (l) {
          link = l;
          $('form').style.display = 'none';
          $('result').style.display = 'block';
          new QRCode($('qr'), { text: l, width: 260, height: 260, correctLevel: QRCode.CorrectLevel.M });
        })
        .withFailureHandler(function (e) { $('err').textContent = e.message; })
        .generarEnlace($('app').value, $('exec').value);
    };
    $('mail').onclick = function () {
      $('msg').textContent = 'Enviando…';
      google.script.run
        .withSuccessHandler(function (email) { $('msg').innerHTML = '<span class="ok">Enviado a ' + email + '. Ábrelo desde tu celular.</span>'; })
        .withFailureHandler(function (e) { $('msg').textContent = e.message; })
        .enviarEnlacePorCorreo(link);
    };
    $('copy').onclick = function () {
      var ta = document.createElement('textarea');
      ta.value = link; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      $('msg').textContent = 'Enlace copiado.';
    };
  </script>
</body>
</html>`;

/* ---------- Instalación ---------- */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var gastos = getOrCreateSheet_(ss, SHEETS.GASTOS, GASTOS_HEADERS);
  gastos.getRange('B:B').setNumberFormat('yyyy-mm-dd');
  gastos.getRange('C:C').setNumberFormat('#,##0.00');

  var cats = getOrCreateSheet_(ss, SHEETS.CATEGORIAS, CATEGORIAS_HEADERS);
  if (cats.getLastRow() < 2) {
    cats.getRange(2, 1, DEFAULT_CATEGORIES.length, CATEGORIAS_HEADERS.length).setValues(DEFAULT_CATEGORIES);
  }

  var config = getOrCreateSheet_(ss, SHEETS.CONFIG, ['Clave', 'Valor']);
  if (config.getLastRow() < 2) {
    config.getRange(2, 1, DEFAULT_CONFIG.length, 2).setValues(DEFAULT_CONFIG);
  }

  buildResumen_(ss);

  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('API_TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '').slice(0, 20);
    props.setProperty('API_TOKEN', token);
  }
  Logger.log('Token de acceso para la app: ' + token);
  return token;
}

/** Muestra el token actual en los registros (por si se perdió). */
function verToken() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('API_TOKEN'));
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#F3E8FF');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Hoja "Resumen" con fórmulas, para ver el mes también desde el Excel. */
function buildResumen_(ss) {
  var sheet = ss.getSheetByName(SHEETS.RESUMEN) || ss.insertSheet(SHEETS.RESUMEN);
  sheet.clear();
  sheet.getRange('A1').setValue('Mes (cualquier día del mes)').setFontWeight('bold');
  sheet.getRange('B1').setFormula('=TODAY()').setNumberFormat('mmmm yyyy');
  sheet.getRange('A2').setValue('Tope mensual').setFontWeight('bold');
  sheet.getRange('B2').setFormula('=IFERROR(VLOOKUP("tope_mensual",Config!A:B,2,FALSE),0)');
  sheet.getRange('A4:F4').setValues([['Categoría', 'Presupuesto', 'Gastado', 'Disponible', '% usado', 'Estado']])
    .setFontWeight('bold').setBackground('#F3E8FF');

  var rows = [];
  for (var r = 5; r < 5 + 30; r++) {
    var i = r - 3; // fila en Categorias
    rows.push([
      '=IF(Categorias!A' + i + '="","",Categorias!A' + i + ')',
      '=IF(A' + r + '="","",Categorias!D' + i + ')',
      '=IF(A' + r + '="","",SUMIFS(Gastos!C:C,Gastos!D:D,A' + r + ',Gastos!B:B,">="&EOMONTH($B$1,-1)+1,Gastos!B:B,"<="&EOMONTH($B$1,0)))',
      '=IF(A' + r + '="","",B' + r + '-C' + r + ')',
      '=IF(OR(A' + r + '="",B' + r + '=0),"",C' + r + '/B' + r + ')',
      '=IF(A' + r + '="","",IF(Categorias!E' + i + '="ahorro",IF(C' + r + '>=B' + r + ',"🎯 Meta cumplida","Ahorrando"),IF(C' + r + '>B' + r + ',"⚠️ Excedido",IF(C' + r + '>=0.8*B' + r + ',"Cerca del límite","OK"))))'
    ]);
  }
  sheet.getRange(5, 1, rows.length, 6).setFormulas(rows);
  sheet.getRange('E5:E34').setNumberFormat('0%');
  sheet.getRange('A36').setValue('Total gastos (sin ahorro)').setFontWeight('bold');
  sheet.getRange('C36').setFormula('=SUMIFS(C5:C34,F5:F34,"<>🎯 Meta cumplida",F5:F34,"<>Ahorrando")');
  sheet.getRange('A37').setValue('Disponible del tope').setFontWeight('bold');
  sheet.getRange('C37').setFormula('=B2-C36');
  sheet.autoResizeColumns(1, 6);
}

/* ---------- API web ---------- */

function doGet(e) {
  return handle_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'JSON inválido' });
  }
  return handle_(body);
}

function handle_(req) {
  var token = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!token || req.token !== token) {
    return json_({ ok: false, error: 'Token inválido. Revisa Ajustes en la app.' });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data;
    switch (req.action) {
      case 'ping': data = { pong: true, sheet: ss.getName() }; break;
      case 'getAll': data = getAll_(ss); break;
      case 'addExpense': data = addExpense_(ss, req.expense || {}, req.photo); break;
      case 'deleteExpense': data = deleteExpense_(ss, req.id); break;
      case 'saveCategory': data = saveCategory_(ss, req.category || {}, req.originalName); break;
      case 'deleteCategory': data = deleteCategory_(ss, req.name); break;
      case 'saveConfig': data = saveConfig_(ss, req.config || {}); break;
      default: return json_({ ok: false, error: 'Acción desconocida: ' + req.action });
    }
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ---------- Lectura ---------- */

function getAll_(ss) {
  return {
    config: readConfig_(ss),
    categories: readCategories_(ss),
    expenses: readExpenses_(ss)
  };
}

function readConfig_(ss) {
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  var out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().forEach(function (r) {
    if (r[0]) out[r[0]] = r[1];
  });
  if (out.tope_mensual !== undefined) out.tope_mensual = Number(out.tope_mensual) || 0;
  return out;
}

function readCategories_(ss) {
  var sheet = ss.getSheetByName(SHEETS.CATEGORIAS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, CATEGORIAS_HEADERS.length).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      return {
        name: String(r[0]),
        emoji: String(r[1] || '✨'),
        color: String(r[2] || '#B39CD0'),
        budget: Number(r[3]) || 0,
        type: r[4] === 'ahorro' ? 'ahorro' : 'gasto',
        active: r[5] !== false && String(r[5]).toUpperCase() !== 'FALSE',
        protected: r[6] === true || String(r[6]).toUpperCase() === 'TRUE'
      };
    });
}

function readExpenses_(ss) {
  var sheet = ss.getSheetByName(SHEETS.GASTOS);
  if (!sheet || sheet.getLastRow() < 2) return [];
  var tz = ss.getSpreadsheetTimeZone();
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, GASTOS_HEADERS.length).getValues()
    .filter(function (r) { return r[0] !== ''; })
    .map(function (r) {
      return {
        id: String(r[0]),
        date: r[1] instanceof Date ? Utilities.formatDate(r[1], tz, 'yyyy-MM-dd') : String(r[1]).slice(0, 10),
        amount: Number(r[2]) || 0,
        category: String(r[3]),
        description: String(r[4] || ''),
        payment: String(r[5] || ''),
        voucher: String(r[6] || '')
      };
    });
}

/* ---------- Escritura ---------- */

function addExpense_(ss, exp, photo) {
  var amount = Number(exp.amount);
  if (!(amount > 0)) throw new Error('El monto debe ser mayor a 0');
  if (!exp.category) throw new Error('Falta la categoría');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exp.date || '')) throw new Error('Fecha inválida');

  var id = Utilities.getUuid().slice(0, 8);
  var voucherUrl = '';
  if (photo && photo.base64) {
    voucherUrl = saveVoucher_(photo, exp.date + '_' + exp.category + '_' + id);
  }

  var parts = exp.date.split('-');
  var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  var sheet = ss.getSheetByName(SHEETS.GASTOS);
  sheet.appendRow([id, date, amount, exp.category, exp.description || '', exp.payment || '', voucherUrl, new Date()]);

  return { id: id, date: exp.date, amount: amount, category: exp.category,
    description: exp.description || '', payment: exp.payment || '', voucher: voucherUrl };
}

function saveVoucher_(photo, baseName) {
  var folders = DriveApp.getFoldersByName(VOUCHER_FOLDER);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(VOUCHER_FOLDER);
  var mime = photo.mimeType || 'image/jpeg';
  var ext = mime.split('/')[1] || 'jpg';
  var blob = Utilities.newBlob(Utilities.base64Decode(photo.base64), mime, baseName + '.' + ext);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/file/d/' + file.getId() + '/view';
}

function deleteExpense_(ss, id) {
  var sheet = ss.getSheetByName(SHEETS.GASTOS);
  var row = findRow_(sheet, 1, id);
  if (!row) throw new Error('Gasto no encontrado');
  sheet.deleteRow(row);
  return { id: id };
}

function saveCategory_(ss, cat, originalName) {
  var name = String(cat.name || '').trim();
  if (!name) throw new Error('La categoría necesita un nombre');
  var sheet = ss.getSheetByName(SHEETS.CATEGORIAS);
  var values = [name, cat.emoji || '✨', cat.color || '#B39CD0', Number(cat.budget) || 0,
    cat.type === 'ahorro' ? 'ahorro' : 'gasto', cat.active !== false, cat.protected === true];

  var row = findRow_(sheet, 1, originalName || name);
  if (originalName && originalName !== name && findRow_(sheet, 1, name)) {
    throw new Error('Ya existe una categoría llamada ' + name);
  }
  if (row) {
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    if (originalName && originalName !== name) renameCategoryInExpenses_(ss, originalName, name);
  } else {
    sheet.appendRow(values);
  }
  return readCategories_(ss);
}

function renameCategoryInExpenses_(ss, from, to) {
  var sheet = ss.getSheetByName(SHEETS.GASTOS);
  if (sheet.getLastRow() < 2) return;
  var range = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1);
  var vals = range.getValues().map(function (r) { return [r[0] === from ? to : r[0]]; });
  range.setValues(vals);
}

/** No borra la fila: la desactiva para no perder el historial de gastos. */
function deleteCategory_(ss, name) {
  var sheet = ss.getSheetByName(SHEETS.CATEGORIAS);
  var row = findRow_(sheet, 1, name);
  if (!row) throw new Error('Categoría no encontrada');
  sheet.getRange(row, 6).setValue(false);
  return readCategories_(ss);
}

function saveConfig_(ss, cfg) {
  var sheet = ss.getSheetByName(SHEETS.CONFIG);
  Object.keys(cfg).forEach(function (key) {
    var row = findRow_(sheet, 1, key);
    if (row) sheet.getRange(row, 2).setValue(cfg[key]);
    else sheet.appendRow([key, cfg[key]]);
  });
  return readConfig_(ss);
}

function findRow_(sheet, col, value) {
  if (!value || sheet.getLastRow() < 2) return 0;
  var vals = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(value)) return i + 2;
  }
  return 0;
}

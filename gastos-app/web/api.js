// Capa de datos: Google Sheets (vía Apps Script) o modo demo guardado en el navegador.

const SETTINGS_KEY = 'misgastos.settings';
const DEMO_KEY = 'misgastos.demo';

const DEFAULT_CATEGORIES = [
  { name: 'Comida', emoji: '🍜', color: '#F4A261', budget: 800, type: 'gasto', active: true, protected: false },
  { name: 'Transporte', emoji: '🚌', color: '#7FB7BE', budget: 300, type: 'gasto', active: true, protected: false },
  { name: 'Salud', emoji: '💊', color: '#E07A9A', budget: 250, type: 'gasto', active: true, protected: true },
  { name: 'Deporte', emoji: '🏃‍♀️', color: '#8CC084', budget: 150, type: 'gasto', active: true, protected: false },
  { name: 'Ropa', emoji: '👗', color: '#B39CD0', budget: 250, type: 'gasto', active: true, protected: false },
  { name: 'Maquillaje', emoji: '💄', color: '#F28FAD', budget: 150, type: 'gasto', active: true, protected: false },
  { name: 'Social', emoji: '🥂', color: '#F6BD60', budget: 300, type: 'gasto', active: true, protected: false },
  { name: 'Suscripciones', emoji: '📺', color: '#84A9E8', budget: 100, type: 'gasto', active: true, protected: false },
  { name: 'Ahorros', emoji: '🐷', color: '#6CC4A1', budget: 500, type: 'ahorro', active: true, protected: true },
];

function safeGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
}

export function loadSettings() {
  return { url: '', token: '', ...(safeGet(SETTINGS_KEY) || {}) };
}
export function saveSettings(s) {
  safeSet(SETTINGS_KEY, s);
}

/* ---------- Backend Google Sheets ---------- */

let jsonpSeq = 0;

/**
 * GET con <script> (JSONP). Apps Script responde tras una redirección que Safari
 * no deja leer con fetch(); un <script> no tiene esa restricción.
 */
function jsonp(baseUrl, request, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const cb = `__misGastos${Date.now().toString(36)}${jsonpSeq++}`;
    const script = document.createElement('script');
    const cleanup = () => { clearTimeout(timer); delete window[cb]; script.remove(); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Google tardó demasiado en responder. Revisa tu conexión.')); }, timeoutMs);
    window[cb] = (data) => { cleanup(); resolve(data); };
    script.onerror = () => {
      cleanup();
      reject(new Error('No se pudo conectar con tu hoja. Revisa que la URL termine en /exec y que la implementación tenga acceso "Cualquier usuario".'));
    };
    script.src = `${baseUrl}?p=${encodeURIComponent(JSON.stringify(request))}&callback=${cb}`;
    document.head.appendChild(script);
  });
}

const CHUNK = 3500; // caracteres de base64 por parte (cabe holgado en una URL)

class SheetsBackend {
  constructor(url, token) {
    this.url = url;
    this.token = token;
    this.isDemo = false;
  }

  async call(action, payload = {}) {
    const json = await jsonp(this.url, { token: this.token, action, ...payload });
    if (!json || !json.ok) {
      const err = new Error(json?.error || 'Error desconocido');
      err.code = json?.code;
      err.fromServer = true;
      throw err;
    }
    return json.data;
  }

  ping() { return this.call('ping'); }
  getAll() { return this.call('getAll'); }
  deleteExpense(id) { return this.call('deleteExpense', { id }); }
  saveCategory(category, originalName) { return this.call('saveCategory', { category, originalName }); }
  deleteCategory(name) { return this.call('deleteCategory', { name }); }
  saveConfig(config) { return this.call('saveConfig', { config }); }

  async addExpense(expense, photo, onProgress = () => {}) {
    // El mismo id en cada reintento: la hoja no duplica el gasto.
    const uploadId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    expense = { ...expense, id: uploadId };
    if (!photo) return this.call('addExpense', { expense });
    const ref = { uploadId, mimeType: photo.mimeType, name: photo.name };

    // 1) Intento rápido: la foto completa por POST. No podemos leer la respuesta
    //    (no-cors), así que el paso 2 confirma si llegó.
    try {
      await fetch(this.url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ token: this.token, action: 'stashUpload', uploadId, data: photo.base64 }),
      });
      return await this.call('addExpense', { expense, photo: ref });
    } catch (err) {
      if (err.fromServer && err.code !== 'UPLOAD_MISSING') throw err;
    }

    // 2) Respaldo: la foto en partes pequeñas por GET.
    const parts = [];
    for (let i = 0; i < photo.base64.length; i += CHUNK) parts.push(photo.base64.slice(i, i + CHUNK));
    let done = 0;
    const send = async (index) => {
      await this.call('stashUpload', { uploadId, index, total: parts.length, data: parts[index] });
      onProgress(++done / parts.length);
    };
    const queue = parts.map((_, i) => i);
    const worker = async () => { while (queue.length) await send(queue.shift()); };
    await Promise.all(Array.from({ length: Math.min(4, parts.length) }, worker));
    return this.call('addExpense', { expense, photo: ref });
  }
}

export function testConnection(url, token) {
  return new SheetsBackend(url, token).ping();
}

/* ---------- Backend demo (localStorage) ---------- */

function seedDemo() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const day = today.getDate();
  const iso = (yy, mm, dd) => new Date(yy, mm, dd).toLocaleDateString('en-CA');
  const sample = [
    ['Comida', 'Supermercado', 180], ['Comida', 'Almuerzo con amigas', 65], ['Comida', 'Café', 18],
    ['Transporte', 'Taxi', 25], ['Transporte', 'Recarga tarjeta', 50],
    ['Ropa', 'Vestido', 189], ['Ropa', 'Zapatillas', 230],
    ['Maquillaje', 'Base y labial', 140], ['Maquillaje', 'Serum', 75],
    ['Social', 'Cumpleaños', 120], ['Suscripciones', 'Spotify', 21], ['Suscripciones', 'Netflix', 45],
    ['Salud', 'Farmacia', 60], ['Deporte', 'Gimnasio', 120], ['Ahorros', 'Depósito mensual', 300],
  ];
  const expenses = [];
  sample.forEach(([category, description, amount], i) => {
    const d = Math.max(1, Math.min(day, 1 + ((i * 3) % Math.max(day, 1))));
    expenses.push({ id: `demo${i}`, date: iso(y, m, d), amount, category, description, payment: 'Tarjeta', voucher: '' });
  });
  // Meses anteriores para la tendencia
  for (let back = 1; back <= 5; back++) {
    DEFAULT_CATEGORIES.forEach((c, i) => {
      const factor = 0.6 + ((back * 7 + i * 13) % 9) / 10;
      expenses.push({
        id: `demo-${back}-${i}`, date: iso(y, m - back, 10), amount: Math.round(c.budget * factor),
        category: c.name, description: 'Histórico', payment: 'Tarjeta', voucher: '',
      });
    });
  }
  return {
    config: { tope_mensual: 2500, moneda: 'S/', nombre: '' },
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    expenses,
  };
}

class DemoBackend {
  constructor() {
    this.isDemo = true;
    this.db = safeGet(DEMO_KEY) || seedDemo();
    this.persist();
  }
  persist() { safeSet(DEMO_KEY, this.db); }
  reset() { this.db = seedDemo(); this.persist(); }
  async ping() { return { pong: true, sheet: 'Demo' }; }
  async getAll() { return structuredClone(this.db); }

  async addExpense(expense, photo) {
    const item = {
      ...expense,
      id: Math.random().toString(36).slice(2, 10),
      amount: Number(expense.amount),
      // En demo guardamos una miniatura en el navegador.
      voucher: photo ? `data:${photo.mimeType};base64,${photo.thumb || photo.base64}` : '',
    };
    this.db.expenses.push(item);
    this.persist();
    return item;
  }
  async deleteExpense(id) {
    this.db.expenses = this.db.expenses.filter((e) => e.id !== id);
    this.persist();
    return { id };
  }
  async saveCategory(category, originalName) {
    const key = originalName || category.name;
    if (originalName && originalName !== category.name && this.db.categories.some((c) => c.name === category.name)) {
      throw new Error(`Ya existe una categoría llamada ${category.name}`);
    }
    const idx = this.db.categories.findIndex((c) => c.name === key);
    if (idx >= 0) {
      this.db.categories[idx] = { ...category };
      if (originalName && originalName !== category.name) {
        this.db.expenses.forEach((e) => { if (e.category === originalName) e.category = category.name; });
      }
    } else {
      this.db.categories.push({ ...category });
    }
    this.persist();
    return structuredClone(this.db.categories);
  }
  async deleteCategory(name) {
    const c = this.db.categories.find((x) => x.name === name);
    if (c) c.active = false;
    this.persist();
    return structuredClone(this.db.categories);
  }
  async saveConfig(config) {
    Object.assign(this.db.config, config);
    this.persist();
    return { ...this.db.config };
  }
}

export function createBackend(settings) {
  if (settings.url && settings.token) return new SheetsBackend(settings.url, settings.token);
  return new DemoBackend();
}

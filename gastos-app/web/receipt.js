// Lectura de vouchers: OCR en el navegador (Tesseract.js, se carga solo al usarlo)
// y extracción de monto total, fecha y comercio desde el texto.

const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';

let workerPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar el lector de vouchers'));
    document.head.appendChild(s);
  });
}

async function getWorker() {
  workerPromise ||= (async () => {
    if (!window.Tesseract) await loadScript(TESSERACT_URL);
    return window.Tesseract.createWorker('spa');
  })().catch((err) => { workerPromise = null; throw err; });
  return workerPromise;
}

/** @param {string} image data URL o URL de la imagen */
export async function readReceipt(image) {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  return parseReceipt(data.text || '');
}

/** Convierte "1,234.50", "1.234,50", "45,90" o "45.90" a número. */
export function parseAmount(token) {
  let s = token.replace(/[^\d.,]/g, '');
  if (!/\d/.test(s)) return NaN;
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot >= 0 && lastComma >= 0) {
    const dec = lastDot > lastComma ? '.' : ',';
    s = s.split(dec === '.' ? ',' : '.').join('');
    if (dec === ',') s = s.replace(',', '.');
  } else if (lastComma >= 0) {
    // "45,90" es decimal; "1,250" es miles.
    s = /,\d{2}$/.test(s) && s.split(',').length === 2 ? s.replace(',', '.') : s.replace(/,/g, '');
  } else if (s.split('.').length > 2) {
    const parts = s.split('.');
    s = parts.slice(0, -1).join('') + '.' + parts.at(-1);
  }
  return Number(s);
}

const MONEY_RE = /\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2}\b|\d+[.,]\d{2}\b/g;

function amountsIn(line) {
  return (line.replace(/(\d)\s+([.,])\s*(\d{2})\b/g, '$1$2$3').match(MONEY_RE) || [])
    .map((t) => parseAmount(t.replace(/\s/g, '')))
    .filter((n) => n > 0 && n < 100000);
}

/**
 * @returns {{amount: number|null, date: string|null, merchant: string|null}}
 */
export function parseReceipt(text, today = new Date()) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Monto: línea de "total" (no subtotal), con preferencia por "total a pagar" / "importe total".
  let amount = null;
  const scored = lines
    .map((l, i) => {
      const low = l.toLowerCase();
      if (!/total|a pagar|importe/.test(low) || /sub\s*-?\s*total|descuento|vuelto|cambio|gravad|igv|op\.?\s/.test(low)) return null;
      const score = /total a pagar|importe total|total pagado|monto total/.test(low) ? 3 : /total/.test(low) ? 2 : 1;
      const nums = amountsIn(l).length ? amountsIn(l) : amountsIn(lines[i + 1] || '');
      return nums.length ? { score, i, value: nums.at(-1) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.i - a.i);
  if (scored.length) amount = scored[0].value;
  else {
    const all = lines.flatMap(amountsIn);
    if (all.length) amount = Math.max(...all);
  }

  // 2. Fecha: dd/mm/yyyy (formato peruano) o yyyy-mm-dd; no más de 1 día en el futuro.
  let date = null;
  const limit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const candidates = [];
  for (const m of text.matchAll(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) candidates.push([+m[1], +m[2], +m[3]]);
  for (const m of text.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})\b/g)) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    candidates.push([y, +m[2], +m[1]]);
  }
  for (const [y, mo, d] of candidates) {
    const dt = new Date(y, mo - 1, d);
    if (mo >= 1 && mo <= 12 && dt.getDate() === d && y >= 2000 && dt <= limit) {
      date = dt.toLocaleDateString('en-CA');
      break;
    }
  }

  // 3. Comercio: primera línea con texto "de verdad" (sin RUC, fechas ni montos).
  const merchant = lines.find((l) => {
    const letters = (l.match(/[a-záéíóúñ]/gi) || []).length;
    return letters >= 4 && letters / l.length > 0.5 && !/ruc|boleta|factura|fecha|ticket|electr[oó]nica/i.test(l);
  });

  return {
    amount: amount != null ? Math.round(amount * 100) / 100 : null,
    date,
    merchant: merchant ? merchant.replace(/\s{2,}/g, ' ').slice(0, 40) : null,
  };
}

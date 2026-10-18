import { createBackend, loadSettings, saveSettings, testConnection } from './api.js';
import { analyzeMonth, monthlyTrend, monthKey, shiftMonth, CURRENCY } from './insights.js';
import { readReceipt } from './receipt.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `${CURRENCY.symbol} ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const money0 = (n) => `${CURRENCY.symbol} ${Math.round(n).toLocaleString('es-PE')}`;
const todayISO = () => new Date().toLocaleDateString('en-CA');
const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(c) ? c : '#B39CD0');

const VIEW_TITLES = { home: 'Tu mes', expenses: 'Gastos', categories: 'Metas', settings: 'Ajustes' };

const state = {
  settings: loadSettings(),
  backend: null,
  data: { config: {}, categories: [], expenses: [] },
  month: monthKey(new Date()),
  view: 'home',
  filter: 'all',
  photo: null,
  selectedCat: null,
  editingCat: null,
  ocrRun: 0,
};

/* ---------- Utilidades UI ---------- */

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}

async function withLoader(fn) {
  $('#loader').hidden = false;
  try { return await fn(); }
  catch (err) { toast(`⚠️ ${err.message}`); throw err; }
  finally { $('#loader').hidden = true; }
}

const monthLabel = (key, opts = { month: 'long', year: 'numeric' }) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-PE', opts);
};

/* ---------- Carga ---------- */

async function init() {
  state.backend = createBackend(state.settings);
  bindEvents();
  await reload();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function reload() {
  try {
    state.data = await withLoader(() => state.backend.getAll());
  } catch {
    // Mantenemos los datos que hubiera; el toast ya mostró el error.
  }
  CURRENCY.symbol = state.data.config?.moneda || 'S/';
  render();
}

/* ---------- Render ---------- */

function render() {
  $$('.cur').forEach((el) => { el.textContent = CURRENCY.symbol; });
  const name = state.data.config?.nombre;
  $('#hello').textContent = name ? `Hola, ${name} ✨` : 'Hola ✨';
  $('#month-label').textContent = monthLabel(state.month, { month: 'short', year: '2-digit' });
  $('#month-picker').hidden = !['home', 'expenses'].includes(state.view);
  $('#view-title').textContent = VIEW_TITLES[state.view];

  const banner = $('#banner');
  banner.hidden = !state.backend.isDemo;
  banner.innerHTML = '🌱 Estás en <strong>modo demo</strong>. Conecta tu Google Sheet en <a href="#" data-goto="settings">Ajustes</a>.';

  const analysis = analyzeMonth(state.data, state.month);
  renderHome(analysis);
  renderExpenses(analysis);
  renderCategories(analysis);
  renderSettings();
}

function renderHome(a) {
  const t = a.totals;
  const ratio = t.tope > 0 ? t.spent / t.tope : 0;
  const ring = $('#hero-ring');
  const C = 2 * Math.PI * 52;
  ring.style.strokeDashoffset = String(C * (1 - Math.min(ratio, 1)));
  ring.style.stroke = ratio > 1 ? 'var(--danger)' : ratio > 0.85 ? 'var(--warn)' : 'var(--primary)';
  $('#hero-pct').textContent = t.tope > 0 ? `${Math.round(ratio * 100)}%` : '—';
  $('#hero-spent').textContent = money0(t.spent);
  $('#hero-tope').textContent = t.tope > 0 ? money0(t.tope) : 'sin tope';
  $('#hero-left').textContent = t.remaining >= 0 ? `💸 Quedan ${money0(t.remaining)}` : `🚨 Excedido ${money0(-t.remaining)}`;
  $('#hero-daily').hidden = !t.isCurrent;
  $('#hero-daily').textContent = `📅 ${money0(t.dailyAllowance)}/día · ${t.daysLeft} días`;

  $('#stat-proj').textContent = t.isCurrent ? money0(t.projectedTotal) : money0(t.spent);
  $('#stat-proj').style.color = t.tope > 0 && t.projectedTotal > t.tope ? 'var(--danger)' : '';
  $('#stat-saved').textContent = t.savingGoal > 0 ? `${money0(t.saved)} / ${money0(t.savingGoal)}` : money0(t.saved);
  $('#stat-saved-bar').style.width = `${t.savingGoal > 0 ? Math.min(100, (t.saved / t.savingGoal) * 100) : 0}%`;

  $('#alerts').innerHTML = a.alerts.length
    ? a.alerts.map((al) => `
      <div class="alert ${al.level}" ${al.category ? `data-cat="${esc(al.category)}"` : ''}>
        <span class="dot"></span>
        <div class="alert-body"><p class="alert-title">${esc(al.title)}</p><p class="muted small">${esc(al.text)}</p></div>
        <span class="alert-amount">+${money0(al.amount)}</span>
      </div>`).join('')
    : '<div class="empty">Sin excesos este mes 🌷</div>';

  $('#recs').innerHTML = a.recommendations.length
    ? a.recommendations.map((r) => `
      <article class="card rec">
        <div class="rec-icon">${r.icon}</div>
        <div style="flex:1;min-width:0">
          <h4>${esc(r.title)}</h4>
          <p>${esc(r.text)}</p>
          ${r.cuts?.length ? `<ul class="cuts">${r.cuts.map((c) => `
            <li style="--cat:${safeColor(c.color)}"><span>${esc(c.emoji)} ${esc(c.name)} <span class="sub">· nuevo límite ${money0(c.newLimit)}</span></span><strong>−${money0(c.amount)}</strong></li>`).join('')}</ul>` : ''}
          ${r.kind === 'compensate' && !r.cuts?.length ? '<p class="small" style="margin-top:8px">No te queda holgura en otras categorías: evita gastos no esenciales hasta fin de mes.</p>' : ''}
          ${r.uncovered ? `<p class="small" style="margin-top:8px;color:var(--danger)">Aun así faltarían ${money0(r.uncovered)}: pausa compras no esenciales o usa parte del ahorro solo si es necesario.</p>` : ''}
        </div>
      </article>`).join('')
    : '<div class="empty">Registra tus gastos para recibir recomendaciones 💡</div>';

  const shown = a.categories.filter((c) => c.budget > 0 || c.spent > 0);
  $('#cat-progress').innerHTML = shown.length
    ? shown.map((c) => {
      const pct = c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 100;
      const proj = c.budget > 0 && c.status === 'risk' ? Math.min(100, (c.projected / c.budget) * 100) : null;
      const badge = { exceeded: 'Excedido', risk: 'En riesgo', warning: '80%+', goal: 'Meta ✓' }[c.status];
      const left = c.type === 'ahorro'
        ? (c.budget - c.spent > 0 ? `faltan ${money0(c.budget - c.spent)}` : '¡meta cumplida!')
        : (c.budget - c.spent >= 0 ? `quedan ${money0(c.budget - c.spent)}` : `exceso ${money0(c.spent - c.budget)}`);
      return `
        <div class="cat-row" data-cat="${esc(c.name)}" style="--cat:${c.status === 'exceeded' ? 'var(--danger)' : safeColor(c.color)}">
          <div class="cat-emoji" style="--cat:${safeColor(c.color)}">${esc(c.emoji)}</div>
          <div>
            <div class="cat-name">${esc(c.name)} ${badge ? `<span class="badge ${c.status}">${badge}</span>` : ''}</div>
            <div class="cat-meta">${money0(c.spent)} de ${money0(c.budget)} · ${left}</div>
            <div class="bar"><span style="width:${pct}%"></span>${proj ? `<i style="left:${proj}%" title="Proyección"></i>` : ''}</div>
          </div>
          <div class="cat-amt">${c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : '—'}%</div>
        </div>`;
    }).join('')
    : '<div class="empty">Aún no hay categorías con metas</div>';

  renderDonut(a.categories.filter((c) => c.type === 'gasto' && c.spent > 0));
  renderTrend(t);
}

function renderDonut(cats) {
  const total = cats.reduce((s, c) => s + c.spent, 0);
  const r = 15.9155; // circunferencia = 100
  let offset = 0;
  const segs = cats.map((c) => {
    const p = (c.spent / total) * 100;
    const seg = `<circle cx="21" cy="21" r="${r}" fill="none" stroke="${safeColor(c.color)}" stroke-width="6" stroke-dasharray="${Math.max(p - 0.6, 0.1)} ${100 - Math.max(p - 0.6, 0.1)}" stroke-dashoffset="${-offset}"><title>${esc(c.name)}: ${money0(c.spent)}</title></circle>`;
    offset += p;
    return seg;
  });
  $('#donut').innerHTML = `<circle cx="21" cy="21" r="${r}" fill="none" stroke="var(--track)" stroke-width="6"></circle>${segs.join('')}`;
  $('#donut-legend').innerHTML = total > 0
    ? cats.map((c) => `<li><i style="background:${safeColor(c.color)}"></i><span>${esc(c.emoji)} ${esc(c.name)}</span><b>${Math.round((c.spent / total) * 100)}%</b></li>`).join('')
    : '<li class="muted">Sin gastos este mes</li>';
}

function renderTrend(t) {
  const series = monthlyTrend(state.data, state.month, 6);
  const max = Math.max(...series.map((s) => s.total), t.tope || 0, 1);
  const BAR_MAX = 90; // px; la base de las barras está a 22px del fondo (etiqueta + espacio)
  $('#trend').innerHTML = series.map((s) => `
    <div class="trend-col ${s.month === state.month ? 'current' : ''}">
      <span class="trend-val">${s.total ? Math.round(s.total).toLocaleString('es-PE') : ''}</span>
      <div class="trend-bar ${t.tope && s.total > t.tope ? 'over' : ''}" style="height:${(s.total / max) * BAR_MAX}px"></div>
      <span class="trend-label">${monthLabel(s.month, { month: 'short' })}</span>
    </div>`).join('')
    + (t.tope ? `<div class="trend-cap" style="bottom:${22 + (t.tope / max) * BAR_MAX}px"><span>tope</span></div>` : '');
}

function renderExpenses(a) {
  const cats = state.data.categories;
  const byName = Object.fromEntries(cats.map((c) => [c.name, c]));
  const usedCats = [...new Set(a.expenses.map((e) => e.category))];
  if (state.filter !== 'all' && !usedCats.includes(state.filter)) state.filter = 'all';

  $('#expense-filters').innerHTML = [`<button class="filter ${state.filter === 'all' ? 'active' : ''}" data-filter="all">Todos</button>`]
    .concat(usedCats.map((n) => `<button class="filter ${state.filter === n ? 'active' : ''}" data-filter="${esc(n)}">${esc(byName[n]?.emoji || '✨')} ${esc(n)}</button>`))
    .join('');

  const list = a.expenses.filter((e) => state.filter === 'all' || e.category === state.filter);
  if (!list.length) {
    $('#expense-list').innerHTML = '<div class="empty">No hay gastos registrados en este mes.<br/>Toca <strong>+</strong> para agregar uno.</div>';
    return;
  }
  const groups = {};
  list.forEach((e) => { (groups[e.date] ||= []).push(e); });
  $('#expense-list').innerHTML = Object.entries(groups).map(([date, items]) => {
    const [y, m, d] = date.split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'short' });
    return `
      <div class="day-head"><span>${label}</span><span>${money0(items.reduce((s, e) => s + Number(e.amount), 0))}</span></div>
      ${items.map((e) => {
        const c = byName[e.category] || { emoji: '✨', color: '#C9C9D6' };
        const voucher = /^(https:|data:image\/)/.test(e.voucher) ? `<a href="${esc(e.voucher)}" target="_blank" rel="noopener">📎 voucher</a>` : '';
        return `
        <article class="card exp">
          <div class="cat-emoji" style="--cat:${safeColor(c.color)}">${esc(c.emoji)}</div>
          <div style="min-width:0">
            <p class="exp-desc">${esc(e.description || e.category)}</p>
            <p class="exp-sub"><span>${esc(e.category)}${e.payment ? ` · ${esc(e.payment)}` : ''}</span>${voucher}</p>
          </div>
          <div class="exp-right"><div class="exp-amt">${money(e.amount)}</div><button class="del" data-del="${esc(e.id)}">Eliminar</button></div>
        </article>`;
      }).join('')}`;
  }).join('');
}

function renderCategories(a) {
  const t = a.totals;
  $('#tope-input').value = t.tope || '';
  const diff = t.tope - t.budgetsSum;
  $('#budget-sum').innerHTML = `Suma de metas de gasto: <strong>${money0(t.budgetsSum)}</strong> · `
    + (diff >= 0 ? `margen libre ${money0(diff)}` : `<span style="color:var(--danger)">supera el tope en ${money0(-diff)}</span>`);

  const stats = Object.fromEntries(a.categories.map((c) => [c.name, c]));
  const cats = [...state.data.categories].sort((x, y) => Number(y.active) - Number(x.active));
  $('#category-list').innerHTML = cats.map((c) => {
    const s = stats[c.name];
    return `
    <article class="card cat-edit ${c.active ? '' : 'archived'}" data-edit="${esc(c.name)}">
      <div class="cat-emoji" style="--cat:${safeColor(c.color)}">${esc(c.emoji)}</div>
      <div>
        <div class="cat-name">${esc(c.name)} ${c.type === 'ahorro' ? '<span class="badge goal">Ahorro</span>' : ''} ${c.protected ? '🛡️' : ''} ${c.active ? '' : '<span class="badge">Archivada</span>'}</div>
        <div class="cat-meta">Meta mensual ${money0(c.budget)}${s ? ` · este mes ${money0(s.spent)}` : ''}</div>
      </div>
      <span class="chev">›</span>
    </article>`;
  }).join('');
}

function renderSettings() {
  $('#set-url').value = state.settings.url || '';
  $('#set-token').value = state.settings.token || '';
  $('#set-name').value = state.data.config?.nombre || '';
  $('#set-currency').value = state.data.config?.moneda || 'S/';
  $('#demo-card').hidden = !state.backend.isDemo;
  $('#conn-status').textContent = state.backend.isDemo ? '🌱 Modo demo activo' : '✅ Conectado a Google Sheets';
}

/* ---------- Navegación ---------- */

function goto(view) {
  state.view = view;
  $$('.view').forEach((v) => { v.hidden = v.id !== `view-${view}`; });
  $$('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

/* ---------- Gasto nuevo ---------- */

function openExpenseDialog(preselect) {
  const form = $('#expense-form');
  form.reset();
  form.date.value = state.month === monthKey(new Date()) ? todayISO() : `${state.month}-01`;
  state.photo = null;
  updatePhotoPreview();
  const active = state.data.categories.filter((c) => c.active);
  state.selectedCat = preselect && active.some((c) => c.name === preselect) ? preselect : active[0]?.name || null;
  $('#cat-chips').innerHTML = active.map((c) => `
    <button type="button" class="cat-chip ${c.name === state.selectedCat ? 'active' : ''}" style="--cat:${safeColor(c.color)}" data-chip="${esc(c.name)}">${esc(c.emoji)} ${esc(c.name)}</button>`).join('');
  updateBudgetHint();
  $('#expense-dialog').showModal();
  setTimeout(() => form.amount.focus(), 50);
}

function updateBudgetHint() {
  const form = $('#expense-form');
  const hint = $('#budget-hint');
  const cat = state.data.categories.find((c) => c.name === state.selectedCat);
  const month = (form.date.value || todayISO()).slice(0, 7);
  if (!cat || !cat.budget) { hint.textContent = ''; return; }
  const a = analyzeMonth(state.data, month);
  const c = a.categories.find((x) => x.name === cat.name);
  const amount = Number(form.amount.value) || 0;
  const after = (c?.spent || 0) + amount;
  const left = cat.budget - after;
  if (cat.type === 'ahorro') {
    hint.className = 'budget-hint small';
    hint.textContent = left > 0 ? `🐷 Con esto te faltarán ${money0(left)} para tu meta.` : '🎉 ¡Con esto cumples tu meta de ahorro!';
  } else if (left < 0) {
    hint.className = 'budget-hint small over';
    hint.textContent = `⚠️ Con este gasto te excedes ${money0(-left)} en ${cat.name}.`;
  } else {
    const topeLeft = a.totals.tope - a.totals.spent - amount;
    hint.className = `budget-hint small${topeLeft < 0 ? ' over' : ''}`;
    hint.textContent = topeLeft < 0
      ? `⚠️ Te quedarían ${money0(left)} en ${cat.name}, pero superas tu tope mensual en ${money0(-topeLeft)}.`
      : `Te quedarán ${money0(left)} en ${cat.name} este mes.`;
  }
}

function updatePhotoPreview() {
  if (!state.photo) { state.ocrRun++; setOcrStatus(''); }
  const img = $('#photo-preview');
  img.hidden = !state.photo;
  $('#photo-hint').hidden = !!state.photo;
  $('#photo-clear').hidden = !state.photo;
  if (state.photo) img.src = `data:${state.photo.mimeType};base64,${state.photo.base64}`;
  else img.removeAttribute('src');
}

function setOcrStatus(text, cls = '') {
  const el = $('#ocr-status');
  el.textContent = text;
  el.className = `ocr-status small ${cls}`;
}

/** Lee el voucher y completa solo los campos que siguen vacíos. */
async function scanReceipt() {
  const run = ++state.ocrRun;
  const form = $('#expense-form');
  setOcrStatus('🔎 Leyendo voucher…', 'busy');
  try {
    const r = await readReceipt(`data:${state.photo.mimeType};base64,${state.photo.base64}`);
    if (run !== state.ocrRun || !$('#expense-dialog').open) return;
    const found = [];
    if (r.amount && !form.amount.value) { form.amount.value = r.amount.toFixed(2); found.push(`${CURRENCY.symbol} ${r.amount.toFixed(2)}`); }
    if (r.date) { form.date.value = r.date; found.push(r.date.split('-').reverse().join('/')); }
    if (r.merchant && !form.description.value) { form.description.value = r.merchant; found.push(r.merchant); }
    updateBudgetHint();
    setOcrStatus(found.length
      ? `✨ Detectado: ${found.join(' · ')}. Revisa que esté bien.`
      : (r.amount ? `✨ Monto en el voucher: ${CURRENCY.symbol} ${r.amount.toFixed(2)}` : 'No pude leer el monto; ingrésalo a mano.'), found.length ? 'ok' : '');
  } catch {
    if (run === state.ocrRun) setOcrStatus('No pude leer el voucher (¿sin conexión?). La foto igual se guardará.');
  }
}

/** Reduce la foto antes de subirla: los vouchers no necesitan 12 MP. */
async function compressImage(file, maxSide = 1400, quality = 0.72) {
  const bitmap = await createImageBitmap(file).catch(() => null);
  const src = bitmap || await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('No se pudo leer la imagen'));
    img.src = URL.createObjectURL(file);
  });
  const draw = (side, q) => {
    const scale = Math.min(1, side / Math.max(src.width, src.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(src.width * scale);
    canvas.height = Math.round(src.height * scale);
    canvas.getContext('2d').drawImage(src, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', q).split(',')[1];
  };
  return { mimeType: 'image/jpeg', name: file.name, base64: draw(maxSide, quality), thumb: draw(320, 0.6) };
}

async function submitExpense(ev) {
  ev.preventDefault();
  const form = ev.target;
  if (!state.selectedCat) { toast('Elige una categoría'); return; }
  const expense = {
    amount: Number(form.amount.value),
    category: state.selectedCat,
    date: form.date.value,
    description: form.description.value.trim(),
    payment: form.payment.value,
  };
  if (!(expense.amount > 0)) { toast('Ingresa un monto válido'); return; }
  const btn = $('#expense-save');
  btn.disabled = true;
  btn.textContent = state.photo ? 'Subiendo voucher…' : 'Guardando…';
  try {
    let photo = null;
    if (state.photo) {
      // El backend de Sheets solo necesita la imagen completa; el demo guarda la miniatura.
      photo = state.backend.isDemo
        ? { mimeType: state.photo.mimeType, base64: state.photo.thumb }
        : { mimeType: state.photo.mimeType, base64: state.photo.base64, name: state.photo.name };
    }
    const saved = await state.backend.addExpense(expense, photo);
    state.data.expenses.push(saved);
    $('#expense-dialog').close();
    state.month = expense.date.slice(0, 7);
    render();
    const a = analyzeMonth(state.data, state.month).categories.find((c) => c.name === expense.category);
    toast(a && a.status === 'exceeded' ? `Guardado · ⚠️ ${expense.category} excedida` : 'Gasto guardado 🌸');
  } catch (err) {
    toast(`⚠️ ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Guardar gasto';
  }
}

/* ---------- Categorías ---------- */

function openCategoryDialog(name) {
  const form = $('#category-form');
  const cat = state.data.categories.find((c) => c.name === name);
  state.editingCat = cat ? cat.name : null;
  $('#category-dialog-title').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
  form.name.value = cat?.name || '';
  form.emoji.value = cat?.emoji || '✨';
  form.color.value = safeColor(cat?.color || '#B39CD0');
  form.budget.value = cat?.budget ?? '';
  form.type.value = cat?.type || 'gasto';
  form.protected.checked = !!cat?.protected;
  const del = $('#category-delete');
  del.hidden = !cat;
  del.textContent = cat && !cat.active ? 'Reactivar' : 'Archivar';
  $('#category-dialog').showModal();
}

async function submitCategory(ev) {
  ev.preventDefault();
  const form = ev.target;
  const prev = state.data.categories.find((c) => c.name === state.editingCat);
  const category = {
    name: form.name.value.trim(),
    emoji: form.emoji.value.trim() || '✨',
    color: form.color.value,
    budget: Number(form.budget.value) || 0,
    type: form.type.value,
    protected: form.protected.checked,
    active: prev ? prev.active : true,
  };
  if (!category.name) return;
  if (!prev && state.data.categories.some((c) => c.name.toLowerCase() === category.name.toLowerCase())) {
    toast('Ya existe una categoría con ese nombre'); return;
  }
  await withLoader(async () => {
    state.data.categories = await state.backend.saveCategory(category, state.editingCat);
    if (state.editingCat && state.editingCat !== category.name) {
      state.data.expenses.forEach((e) => { if (e.category === state.editingCat) e.category = category.name; });
    }
  }).then(() => { $('#category-dialog').close(); render(); toast('Categoría guardada'); }).catch(() => {});
}

async function toggleArchiveCategory() {
  const cat = state.data.categories.find((c) => c.name === state.editingCat);
  if (!cat) return;
  await withLoader(async () => {
    state.data.categories = cat.active
      ? await state.backend.deleteCategory(cat.name)
      : await state.backend.saveCategory({ ...cat, active: true }, cat.name);
  }).then(() => { $('#category-dialog').close(); render(); toast(cat.active ? 'Categoría archivada' : 'Categoría reactivada'); }).catch(() => {});
}

/* ---------- Eventos ---------- */

function bindEvents() {
  $$('.tab').forEach((b) => b.addEventListener('click', () => goto(b.dataset.view)));
  $('#fab').addEventListener('click', () => openExpenseDialog(state.filter !== 'all' ? state.filter : null));
  $$('[data-month]').forEach((b) => b.addEventListener('click', () => {
    state.month = shiftMonth(state.month, Number(b.dataset.month));
    render();
  }));

  document.addEventListener('click', (ev) => {
    const go = ev.target.closest('[data-goto]');
    if (go) { ev.preventDefault(); goto(go.dataset.goto); }
  });

  // Tocar una categoría del tablero abre sus gastos.
  $('#view-home').addEventListener('click', (ev) => {
    const row = ev.target.closest('[data-cat]');
    if (row) { state.filter = row.dataset.cat; goto('expenses'); }
  });

  $('#expense-filters').addEventListener('click', (ev) => {
    const f = ev.target.closest('[data-filter]');
    if (f) { state.filter = f.dataset.filter; render(); }
  });

  $('#expense-list').addEventListener('click', async (ev) => {
    const del = ev.target.closest('[data-del]');
    if (!del || !confirm('¿Eliminar este gasto?')) return;
    const id = del.dataset.del;
    await withLoader(() => state.backend.deleteExpense(id)).then(() => {
      state.data.expenses = state.data.expenses.filter((e) => e.id !== id);
      render();
      toast('Gasto eliminado');
    }).catch(() => {});
  });

  // Formulario de gasto
  const form = $('#expense-form');
  form.addEventListener('submit', submitExpense);
  form.amount.addEventListener('input', updateBudgetHint);
  form.date.addEventListener('change', updateBudgetHint);
  $('#expense-cancel').addEventListener('click', () => $('#expense-dialog').close());
  $('#cat-chips').addEventListener('click', (ev) => {
    const chip = ev.target.closest('[data-chip]');
    if (!chip) return;
    state.selectedCat = chip.dataset.chip;
    $$('.cat-chip').forEach((c) => c.classList.toggle('active', c === chip));
    updateBudgetHint();
  });
  $('#photo-input').addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    try {
      state.photo = await compressImage(file);
      updatePhotoPreview();
      scanReceipt();
    } catch (err) {
      toast(`⚠️ ${err.message}`);
    }
    ev.target.value = '';
  });
  $('#photo-clear').addEventListener('click', () => { state.photo = null; updatePhotoPreview(); });

  // Categorías y tope
  $('#add-category').addEventListener('click', () => openCategoryDialog(null));
  $('#category-list').addEventListener('click', (ev) => {
    const card = ev.target.closest('[data-edit]');
    if (card) openCategoryDialog(card.dataset.edit);
  });
  $('#category-form').addEventListener('submit', submitCategory);
  $('#category-cancel').addEventListener('click', () => $('#category-dialog').close());
  $('#category-delete').addEventListener('click', toggleArchiveCategory);
  $('#save-tope').addEventListener('click', async () => {
    const tope = Number($('#tope-input').value) || 0;
    await withLoader(async () => { state.data.config = await state.backend.saveConfig({ tope_mensual: tope }); })
      .then(() => { render(); toast('Tope mensual guardado'); }).catch(() => {});
  });

  // Ajustes
  $('#save-settings').addEventListener('click', async () => {
    const url = $('#set-url').value.trim();
    const token = $('#set-token').value.trim();
    if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(url)) { toast('La URL debe terminar en /exec'); return; }
    try {
      const res = await withLoader(() => testConnection(url, token));
      state.settings = { url, token };
      saveSettings(state.settings);
      state.backend = createBackend(state.settings);
      toast(`Conectado a “${res.sheet}” ✅`);
      await reload();
    } catch { /* toast ya mostrado */ }
  });
  $('#disconnect').addEventListener('click', async () => {
    state.settings = { url: '', token: '' };
    saveSettings(state.settings);
    state.backend = createBackend(state.settings);
    await reload();
    toast('Modo demo activado');
  });
  $('#save-prefs').addEventListener('click', async () => {
    const cfg = { nombre: $('#set-name').value.trim(), moneda: $('#set-currency').value.trim() || 'S/' };
    await withLoader(async () => { state.data.config = await state.backend.saveConfig(cfg); })
      .then(() => { CURRENCY.symbol = state.data.config.moneda || 'S/'; render(); toast('Preferencias guardadas'); }).catch(() => {});
  });
  $('#reset-demo').addEventListener('click', async () => {
    if (!state.backend.isDemo || !confirm('¿Reiniciar los datos de ejemplo?')) return;
    state.backend.reset();
    await reload();
  });

  // Cerrar hojas tocando el fondo
  $$('dialog.sheet').forEach((d) => d.addEventListener('click', (ev) => { if (ev.target === d) d.close(); }));
}

init();

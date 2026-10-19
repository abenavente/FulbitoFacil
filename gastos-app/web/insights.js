// Análisis del mes: estado por categoría, excesos, proyecciones y recomendaciones.
// Funciones puras (sin DOM) para poder probarlas en Node.

export const monthKey = (date) => date.toLocaleDateString('en-CA').slice(0, 7);

export function shiftMonth(key, delta) {
  const [y, m] = key.split('-').map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * @param {{config, categories, expenses}} data
 * @param {string} month  'YYYY-MM'
 * @param {Date} today
 */
export function analyzeMonth(data, month, today = new Date()) {
  const [y, m] = month.split('-').map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const currentMonth = monthKey(today);
  const isCurrent = month === currentMonth;
  const isFuture = month > currentMonth;
  const daysElapsed = isCurrent ? today.getDate() : isFuture ? 0 : daysInMonth;
  const daysLeft = isCurrent ? daysInMonth - today.getDate() + 1 : isFuture ? daysInMonth : 0;
  const pace = daysElapsed > 0 ? daysInMonth / daysElapsed : 1;

  const tope = Number(data.config?.tope_mensual) || 0;
  const monthExpenses = data.expenses.filter((e) => e.date.startsWith(month));

  const spentBy = {};
  monthExpenses.forEach((e) => { spentBy[e.category] = (spentBy[e.category] || 0) + Number(e.amount); });

  // Categorías activas + las inactivas/desconocidas que tengan gastos este mes.
  const cats = data.categories.filter((c) => c.active || spentBy[c.name]);
  Object.keys(spentBy).forEach((name) => {
    if (!cats.some((c) => c.name === name)) {
      cats.push({ name, emoji: '✨', color: '#C9C9D6', budget: 0, type: 'gasto', active: false, protected: false });
    }
  });

  const categories = cats.map((c) => {
    const spent = round2(spentBy[c.name] || 0);
    const budget = Number(c.budget) || 0;
    // Proyección lineal solo para el mes en curso; suscripciones y ahorro no se proyectan.
    const projectable = isCurrent && c.type === 'gasto' && !/suscrip/i.test(c.name);
    const projected = round2(projectable ? spent * pace : spent);
    const pct = budget > 0 ? spent / budget : spent > 0 ? Infinity : 0;
    let status = 'ok';
    if (c.type === 'ahorro') {
      status = budget > 0 && spent >= budget ? 'goal' : 'saving';
    } else if (budget > 0 || spent > 0) {
      if (spent > budget) status = 'exceeded';
      else if (isCurrent && projected > budget * 1.05 && daysLeft > 2) status = 'risk';
      else if (pct >= 0.8) status = 'warning';
    }
    return { ...c, spent, budget, projected, pct, status, excess: round2(Math.max(0, spent - budget)) };
  });

  const gastoCats = categories.filter((c) => c.type === 'gasto');
  const savingCats = categories.filter((c) => c.type === 'ahorro');
  const spent = round2(gastoCats.reduce((s, c) => s + c.spent, 0));
  const projectedTotal = round2(gastoCats.reduce((s, c) => s + c.projected, 0));
  const budgetsSum = round2(gastoCats.filter((c) => c.active).reduce((s, c) => s + c.budget, 0));
  const saved = round2(savingCats.reduce((s, c) => s + c.spent, 0));
  const savingGoal = round2(savingCats.filter((c) => c.active).reduce((s, c) => s + c.budget, 0));
  const remaining = round2(tope - spent);
  const dailyAllowance = daysLeft > 0 ? round2(Math.max(0, remaining) / daysLeft) : 0;

  const totals = {
    tope, spent, projectedTotal, budgetsSum, saved, savingGoal, remaining, dailyAllowance,
    daysInMonth, daysElapsed, daysLeft, isCurrent, isFuture,
    pct: tope > 0 ? spent / tope : 0,
  };

  return {
    month,
    totals,
    categories: categories.sort((a, b) => b.spent - a.spent),
    expenses: monthExpenses.sort((a, b) => (a.date < b.date ? 1 : -1)),
    alerts: buildAlerts(categories, totals),
    recommendations: buildRecommendations(categories, totals, data, month),
  };
}

function buildAlerts(categories, t) {
  const alerts = [];
  if (t.tope > 0 && t.spent > t.tope) {
    alerts.push({ level: 'danger', title: 'Superaste tu tope mensual', amount: t.spent - t.tope,
      text: `Vas ${pct(t.spent / t.tope)} del tope.` });
  } else if (t.isCurrent && t.tope > 0 && t.projectedTotal > t.tope) {
    alerts.push({ level: 'warning', title: 'A este ritmo superarás tu tope', amount: t.projectedTotal - t.tope,
      text: `Proyección de fin de mes: ${fmtShort(t.projectedTotal)}.` });
  }
  categories.filter((c) => c.status === 'exceeded').forEach((c) => {
    alerts.push({ level: 'danger', title: `${c.emoji} ${c.name} excedida`, amount: c.excess, category: c.name,
      text: c.budget > 0 ? `Usaste ${pct(c.pct)} de tu meta.` : 'No tiene meta asignada.' });
  });
  categories.filter((c) => c.status === 'risk').forEach((c) => {
    alerts.push({ level: 'warning', title: `${c.emoji} ${c.name} en riesgo`, amount: c.projected - c.budget, category: c.name,
      text: `Proyección: ${fmtShort(c.projected)} de ${fmtShort(c.budget)}.` });
  });
  return alerts;
}

/**
 * Recomendaciones:
 *  1. Plan de compensación: el exceso total se reparte entre las categorías con holgura
 *     (no protegidas), proporcional a lo que les queda disponible.
 *  2. Ritmo diario para categorías en riesgo.
 *  3. Tope / metas inconsistentes, ahorro pendiente y tendencias vs meses anteriores.
 */
function buildRecommendations(categories, t, data, month) {
  const recs = [];
  const exceeded = categories.filter((c) => c.status === 'exceeded');
  const totalExcess = round2(exceeded.reduce((s, c) => s + c.excess, 0));

  if (totalExcess > 0) {
    const donors = categories
      .filter((c) => c.type === 'gasto' && !c.protected && c.status !== 'exceeded' && c.budget > 0)
      .map((c) => ({ ...c, slack: round2(c.budget - Math.max(c.spent, c.projected)) }))
      .filter((c) => c.slack > 0);
    const slackSum = donors.reduce((s, c) => s + c.slack, 0);
    const toCover = Math.min(totalExcess, slackSum);
    const cuts = donors
      .map((c) => ({ name: c.name, emoji: c.emoji, color: c.color, amount: round2((c.slack / slackSum) * toCover), newLimit: 0, c }))
      .filter((x) => x.amount >= 1)
      .sort((a, b) => b.amount - a.amount)
      .map(({ c, ...x }) => ({ ...x, newLimit: round2(c.budget - x.amount) }));
    const uncovered = round2(totalExcess - cuts.reduce((s, x) => s + x.amount, 0));

    recs.push({
      kind: 'compensate',
      icon: '🔄',
      title: `Compensa ${fmtShort(totalExcess)} de exceso`,
      text: t.isCurrent
        ? `Te excediste en ${exceeded.map((c) => c.name).join(', ')}. Ajusta estas categorías lo que queda del mes:`
        : `Te excediste en ${exceeded.map((c) => c.name).join(', ')}. El próximo mes podrías ajustar:`,
      cuts,
      uncovered: uncovered > 1 ? uncovered : 0,
    });

    // Si una categoría se excede con frecuencia, sugerir subir su meta.
    exceeded.forEach((c) => {
      const times = [1, 2, 3].filter((back) => {
        const k = shiftMonth(month, -back);
        const s = data.expenses.filter((e) => e.category === c.name && e.date.startsWith(k)).reduce((a, e) => a + Number(e.amount), 0);
        return s > c.budget;
      }).length;
      if (times >= 2) {
        recs.push({ kind: 'rebudget', icon: '🎯', title: `Revisa la meta de ${c.name}`,
          text: `Te pasaste ${times + 1} de los últimos 4 meses. Considera una meta más realista (~${fmtShort(c.spent)}) y bájala en otra categoría.` });
      }
    });
  }

  if (t.isCurrent && t.daysLeft > 0) {
    categories.filter((c) => c.status === 'risk').forEach((c) => {
      const perDay = Math.max(0, (c.budget - c.spent) / t.daysLeft);
      recs.push({ kind: 'pace', icon: '🐢', title: `Frena en ${c.name}`,
        text: `Para no pasarte, gasta máximo ${fmtShort(perDay)} por día en ${c.name} hasta fin de mes.` });
    });
    if (t.tope > 0 && t.remaining > 0) {
      recs.push({ kind: 'daily', icon: '📅', title: `Puedes gastar ${fmtShort(t.dailyAllowance)} al día`,
        text: `Te quedan ${fmtShort(t.remaining)} del tope para ${t.daysLeft} día(s).` });
    }
  }

  if (t.tope > 0 && t.budgetsSum > t.tope) {
    recs.push({ kind: 'config', icon: '🧮', title: 'Tus metas suman más que tu tope',
      text: `La suma de metas (${fmtShort(t.budgetsSum)}) supera el tope (${fmtShort(t.tope)}) en ${fmtShort(t.budgetsSum - t.tope)}. Baja alguna meta en Categorías.` });
  }

  if (t.savingGoal > 0 && t.saved < t.savingGoal && !t.isFuture) {
    const missing = t.savingGoal - t.saved;
    const free = t.tope > 0 ? t.tope - Math.max(t.spent, t.projectedTotal) : 0;
    recs.push({ kind: 'saving', icon: '🐷', title: `Te faltan ${fmtShort(missing)} para tu meta de ahorro`,
      text: free > 0
        ? `Si mantienes el ritmo te sobrarían ~${fmtShort(free)} del tope: muévelos a ahorro.`
        : 'Aparta el ahorro apenas recibas tu ingreso, antes de gastar.' });
  }

  // Tendencia: mayor alza vs promedio de los 3 meses anteriores.
  const trends = categories
    .filter((c) => c.type === 'gasto' && c.spent > 0)
    .map((c) => {
      const prev = [1, 2, 3].map((back) => {
        const k = shiftMonth(month, -back);
        return data.expenses.filter((e) => e.category === c.name && e.date.startsWith(k)).reduce((a, e) => a + Number(e.amount), 0);
      });
      const avg = prev.reduce((a, b) => a + b, 0) / 3;
      return { c, avg, delta: (t.isCurrent ? c.projected : c.spent) - avg };
    })
    .filter((x) => x.avg > 0 && x.delta / x.avg > 0.25)
    .sort((a, b) => b.delta - a.delta);
  if (trends[0]) {
    const { c, avg, delta } = trends[0];
    recs.push({ kind: 'trend', icon: '📈', title: `${c.name} subió ${pct(delta / avg)}`,
      text: `Respecto a tu promedio de los últimos 3 meses (${fmtShort(avg)}).` });
  }

  if (!recs.length && categories.some((c) => c.spent > 0)) {
    recs.push({ kind: 'good', icon: '🌸', title: '¡Vas excelente!', text: 'Todas tus categorías están dentro de sus metas.' });
  }
  return recs;
}

/** Totales de gasto (sin ahorro) de los últimos n meses, para el gráfico de tendencia. */
export function monthlyTrend(data, month, n = 6) {
  const gastoNames = new Set(data.categories.filter((c) => c.type !== 'ahorro').map((c) => c.name));
  const known = new Set(data.categories.map((c) => c.name));
  return Array.from({ length: n }, (_, i) => {
    const k = shiftMonth(month, i - n + 1);
    const total = data.expenses
      .filter((e) => e.date.startsWith(k) && (gastoNames.has(e.category) || !known.has(e.category)))
      .reduce((s, e) => s + Number(e.amount), 0);
    return { month: k, total: round2(total) };
  });
}

const pct = (x) => (Number.isFinite(x) ? `${Math.round(x * 100)}%` : '—');
const fmtShort = (n) => `${CURRENCY.symbol} ${Math.round(n).toLocaleString('es-PE')}`;

// La moneda la fija la app al cargar la configuración.
export const CURRENCY = { symbol: 'S/' };

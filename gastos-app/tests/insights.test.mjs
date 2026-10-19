import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMonth, monthlyTrend, shiftMonth } from '../web/insights.js';

const cats = [
  { name: 'Comida', emoji: '🍜', color: '#F4A261', budget: 800, type: 'gasto', active: true, protected: false },
  { name: 'Ropa', emoji: '👗', color: '#B39CD0', budget: 200, type: 'gasto', active: true, protected: false },
  { name: 'Social', emoji: '🥂', color: '#F6BD60', budget: 300, type: 'gasto', active: true, protected: false },
  { name: 'Salud', emoji: '💊', color: '#E07A9A', budget: 250, type: 'gasto', active: true, protected: true },
  { name: 'Ahorros', emoji: '🐷', color: '#6CC4A1', budget: 500, type: 'ahorro', active: true, protected: true },
];
const e = (date, category, amount) => ({ id: Math.random().toString(36), date, category, amount, description: '' });

test('detecta exceso y reparte la compensación entre categorías con holgura (sin tocar protegidas)', () => {
  const data = {
    config: { tope_mensual: 2000 },
    categories: cats,
    expenses: [e('2026-09-03', 'Ropa', 350), e('2026-09-05', 'Comida', 200), e('2026-09-06', 'Social', 100), e('2026-09-07', 'Ahorros', 100)],
  };
  const a = analyzeMonth(data, '2026-09', new Date(2026, 9, 18)); // mes pasado → sin proyección
  const ropa = a.categories.find((c) => c.name === 'Ropa');
  assert.equal(ropa.status, 'exceeded');
  assert.equal(ropa.excess, 150);
  assert.equal(a.totals.spent, 650); // el ahorro no cuenta como gasto
  assert.equal(a.totals.saved, 100);

  const comp = a.recommendations.find((r) => r.kind === 'compensate');
  assert.ok(comp);
  const names = comp.cuts.map((c) => c.name);
  assert.ok(!names.includes('Salud'), 'Salud está protegida');
  assert.ok(!names.includes('Ahorros'));
  const total = comp.cuts.reduce((s, c) => s + c.amount, 0);
  assert.ok(Math.abs(total - 150) < 1, `cubre el exceso (${total})`);
  // Comida tiene 600 de holgura, Social 200 → 3:1
  assert.ok(comp.cuts[0].name === 'Comida' && Math.abs(comp.cuts[0].amount - 112.5) < 0.01);
  assert.equal(comp.uncovered, 0);
});

test('proyección del mes en curso marca categorías en riesgo y alerta de tope', () => {
  const data = {
    config: { tope_mensual: 1000 },
    categories: cats,
    expenses: [e('2026-10-02', 'Comida', 500), e('2026-10-10', 'Social', 150)],
  };
  const a = analyzeMonth(data, '2026-10', new Date(2026, 9, 10)); // día 10 de 31
  const comida = a.categories.find((c) => c.name === 'Comida');
  assert.equal(comida.status, 'risk');
  assert.equal(comida.projected, 1550);
  assert.ok(a.alerts.some((al) => al.title.includes('ritmo superarás tu tope')));
  assert.ok(a.recommendations.some((r) => r.kind === 'pace' && r.title.includes('Comida')));
  assert.equal(a.totals.daysLeft, 22);
  assert.ok(a.recommendations.some((r) => r.kind === 'config')); // metas (1550) > tope (1000)
});

test('exceso sin holgura disponible reporta monto no cubierto', () => {
  const data = {
    config: { tope_mensual: 1550 },
    categories: cats,
    expenses: [e('2026-09-01', 'Ropa', 500), e('2026-09-02', 'Comida', 790), e('2026-09-02', 'Social', 300)],
  };
  const a = analyzeMonth(data, '2026-09', new Date(2026, 9, 18));
  const comp = a.recommendations.find((r) => r.kind === 'compensate');
  assert.equal(comp.cuts.length, 1); // solo Comida (10) tiene holgura
  assert.equal(comp.uncovered, 290);
  assert.ok(a.alerts.some((al) => al.title.includes('Superaste tu tope')));
});

test('gasto en categoría desconocida se muestra y se cuenta', () => {
  const data = { config: { tope_mensual: 0 }, categories: cats, expenses: [e('2026-09-01', 'Viajes', 80)] };
  const a = analyzeMonth(data, '2026-09', new Date(2026, 9, 18));
  assert.equal(a.totals.spent, 80);
  assert.equal(a.categories.find((c) => c.name === 'Viajes').status, 'exceeded');
});

test('tendencia y cambio de mes', () => {
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  const data = { config: {}, categories: cats, expenses: [e('2026-08-01', 'Comida', 10), e('2026-08-02', 'Ahorros', 999)] };
  const tr = monthlyTrend(data, '2026-09', 3);
  assert.deepEqual(tr.map((t) => t.month), ['2026-07', '2026-08', '2026-09']);
  assert.equal(tr[1].total, 10);
});

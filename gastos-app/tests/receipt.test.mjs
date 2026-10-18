import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, parseReceipt } from '../web/receipt.js';

const today = new Date(2026, 9, 18);

test('parseAmount entiende formatos comunes', () => {
  assert.equal(parseAmount('45.90'), 45.9);
  assert.equal(parseAmount('45,90'), 45.9);
  assert.equal(parseAmount('1,234.50'), 1234.5);
  assert.equal(parseAmount('1.234,50'), 1234.5);
  assert.equal(parseAmount('S/ 1,250'), 1250);
});

test('boleta de supermercado: total a pagar, fecha y comercio', () => {
  const text = `PLAZA VEA
RUC 20100070970
BOLETA DE VENTA ELECTRONICA B123-0004567
FECHA: 12/10/2026 18:45
ARROZ 5KG         24.90
LECHE x6          27.60
SUBTOTAL          44.58
IGV 18%            8.02
OP. GRAVADA       44.58
TOTAL A PAGAR S/  52.60
EFECTIVO          60.00
VUELTO             7.40`;
  assert.deepEqual(parseReceipt(text, today), { amount: 52.6, date: '2026-10-12', merchant: 'PLAZA VEA' });
});

test('sin palabra total usa el mayor monto; ignora fechas futuras', () => {
  const r = parseReceipt('Farmacia Inkafarma\n2026-12-01\nParacetamol 5.50\nIbuprofeno 12.30\n15-10-26', today);
  assert.equal(r.amount, 12.3);
  assert.equal(r.date, '2026-10-15');
  assert.equal(r.merchant, 'Farmacia Inkafarma');
});

test('total en la línea siguiente y espacios del OCR', () => {
  const r = parseReceipt('Starbucks Larcomar\nIMPORTE TOTAL\nS/ 18 .50', today);
  assert.equal(r.amount, 18.5);
  assert.equal(r.date, null);
});

test('texto vacío', () => {
  assert.deepEqual(parseReceipt('', today), { amount: null, date: null, merchant: null });
});

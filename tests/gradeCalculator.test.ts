import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateGradeAverage, parseGermanNumber } from '../src/calculator-core';

test('parses German decimal commas and decimal points', () => {
  assert.equal(parseGermanNumber('2,3'), 2.3);
  assert.equal(parseGermanNumber('2.3'), 2.3);
  assert.equal(parseGermanNumber(''), null);
  assert.equal(parseGermanNumber('abc'), null);
});

test('calculates a simple average', () => {
  const result = calculateGradeAverage(
    [{ subject: 'Mathematik', gradeStr: '2,0' }, { subject: 'Deutsch', gradeStr: '4,0' }],
    false
  );
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.average, 3);
  assert.equal(result.formattedAverage, '3,00');
  assert.equal(result.count, 2);
});

test('calculates a weighted average', () => {
  const result = calculateGradeAverage(
    [
      { subject: 'Hauptfach', gradeStr: '2,0', weightStr: '2' },
      { subject: 'Nebenfach', gradeStr: '4,0', weightStr: '1' },
    ],
    true
  );
  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.average, 8 / 3);
  assert.equal(result.totalWeight, 3);
});

test('rejects grades outside the German 1-to-6 scale', () => {
  const result = calculateGradeAverage([{ gradeStr: '0' }], false);
  assert.equal(result.success, false);
  if (result.success) return;
  assert.match(result.errors.join(' '), /außerhalb des Bereichs/);
});

test('rejects missing grades and invalid weights', () => {
  const missing = calculateGradeAverage([{ gradeStr: '' }], false);
  assert.equal(missing.success, false);
  if (!missing.success) assert.match(missing.errors.join(' '), /Bitte gib eine Note ein/);

  const invalidWeight = calculateGradeAverage([{ gradeStr: '2', weightStr: '0' }], true);
  assert.equal(invalidWeight.success, false);
  if (!invalidWeight.success) assert.match(invalidWeight.errors.join(' '), /Gewichtung muss eine Zahl größer als 0 sein/);
});

test('requires at least one grade row', () => {
  const result = calculateGradeAverage([], false);
  assert.equal(result.success, false);
  if (!result.success) assert.match(result.errors.join(' '), /mindestens eine Notenzeile/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGradeAverage,
  parseGermanNumber,
  formatGermanNumber,
  getGermanVerbalRating,
  CalculationResult,
  convertPointsToGrade,
  convertGradeToPoints,
  getOberstufeRating,
  calculateTargetGrade,
} from '../src/calculator-core';

test('parseGermanNumber handles commas, dots, whitespace, and invalid strings', () => {
  assert.equal(parseGermanNumber('2,5'), 2.5);
  assert.equal(parseGermanNumber('1.7'), 1.7);
  assert.equal(parseGermanNumber(' 3,0 '), 3.0);
  assert.equal(parseGermanNumber(''), null);
  assert.equal(parseGermanNumber('abc'), null);
  assert.equal(parseGermanNumber('NaN'), null);
});

test('Testfall 1 aus Bauplan: Zwei Noten 2,0 und 3,0 ergeben 2,50', () => {
  const result = calculateGradeAverage(
    [
      { gradeStr: '2,0' },
      { gradeStr: '3,0' },
    ],
    false
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.formattedAverage, '2,50');
    assert.equal(result.average, 2.5);
    assert.equal(result.count, 2);
    assert.equal(result.isWeighted, false);
  }
});

test('Testfall 2 aus Bauplan: Noten 2,0, 1,0 und 3,0 ergeben 2,00', () => {
  const result = calculateGradeAverage(
    [
      { gradeStr: '2,0' },
      { gradeStr: '1,0' },
      { gradeStr: '3,0' },
    ],
    false
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.formattedAverage, '2,00');
    assert.equal(result.average, 2.0);
    assert.equal(result.count, 3);
  }
});

test('Testfall 3 aus Bauplan: Gewichtete Noten 2,0 mit Gewichtung 2 und 3,0 mit Gewichtung 1 ergeben 2,33', () => {
  const result = calculateGradeAverage(
    [
      { gradeStr: '2,0', weightStr: '2' },
      { gradeStr: '3,0', weightStr: '1' },
    ],
    true
  );
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.formattedAverage, '2,33');
    assert.equal(Math.round(result.average * 100) / 100, 2.33);
    assert.equal(result.totalWeight, 3);
    assert.equal(result.isWeighted, true);
  }
});

test('Testfall 4: Dezimalkomma und Dezimalpunkt werden gleichermaßen akzeptiert', () => {
  const resultComma = calculateGradeAverage(
    [{ gradeStr: '1,5' }, { gradeStr: '2,5' }],
    false
  );
  const resultDot = calculateGradeAverage(
    [{ gradeStr: '1.5' }, { gradeStr: '2.5' }],
    false
  );
  assert.equal(resultComma.success, true);
  assert.equal(resultDot.success, true);
  if (resultComma.success && resultDot.success) {
    assert.equal(resultComma.formattedAverage, '2,00');
    assert.equal(resultDot.formattedAverage, '2,00');
  }
});

test('Testfall 5 & 6: Ablehnung von 0, 7, negativen Werten, Buchstaben und leeren Eingaben', () => {
  // Note 0
  const r0 = calculateGradeAverage([{ gradeStr: '0' }], false);
  assert.equal(r0.success, false);
  if (!r0.success) {
    assert.ok(r0.errors[0].includes('außerhalb des Bereichs'));
  }

  // Note 7
  const r7 = calculateGradeAverage([{ gradeStr: '7' }], false);
  assert.equal(r7.success, false);
  if (!r7.success) {
    assert.ok(r7.errors[0].includes('außerhalb des Bereichs'));
  }

  // Note negativ
  const rNeg = calculateGradeAverage([{ gradeStr: '-1' }], false);
  assert.equal(rNeg.success, false);

  // Note Buchstabe
  const rChar = calculateGradeAverage([{ gradeStr: 'sehr gut' }], false);
  assert.equal(rChar.success, false);
  if (!rChar.success) {
    assert.ok(rChar.errors[0].includes('keine gültige Note'));
  }

  // Note leer
  const rEmpty = calculateGradeAverage([{ gradeStr: ' ' }], false);
  assert.equal(rEmpty.success, false);
  if (!rEmpty.success) {
    assert.ok(rEmpty.errors[0].includes('Bitte gib eine Note ein'));
  }

  // Gewichtung 0
  const rW0 = calculateGradeAverage([{ gradeStr: '2,0', weightStr: '0' }], true);
  assert.equal(rW0.success, false);
  if (!rW0.success) {
    assert.ok(rW0.errors[0].includes('Gewichtung muss eine Zahl größer als 0'));
  }

  // Gewichtung negativ
  const rWNeg = calculateGradeAverage([{ gradeStr: '2,0', weightStr: '-2' }], true);
  assert.equal(rWNeg.success, false);

  // Gewichtung leer bei gewichtetem Modus
  const rWEmpty = calculateGradeAverage([{ gradeStr: '2,0', weightStr: '' }], true);
  assert.equal(rWEmpty.success, false);
});

test('Verbale Notenbeurteilung nach deutschem Schulsystem', () => {
  assert.equal(getGermanVerbalRating(1.0), 'Sehr gut');
  assert.equal(getGermanVerbalRating(1.5), 'Sehr gut');
  assert.equal(getGermanVerbalRating(1.8), 'Gut');
  assert.equal(getGermanVerbalRating(2.5), 'Gut');
  assert.equal(getGermanVerbalRating(3.2), 'Befriedigend');
  assert.equal(getGermanVerbalRating(4.0), 'Ausreichend');
  assert.equal(getGermanVerbalRating(4.8), 'Mangelhaft');
  assert.equal(getGermanVerbalRating(5.5), 'Ungenügend');
});

test('Oberstufe: Konvertierung von Punkten (0-15) in Noten (KMK-Formel)', () => {
  assert.equal(convertPointsToGrade(15), 0.67);
  assert.equal(convertPointsToGrade(14), 1.0);
  assert.equal(convertPointsToGrade(11), 2.0);
  assert.equal(convertPointsToGrade(5), 4.0);
  assert.equal(convertPointsToGrade(0), 6.0);

  assert.equal(convertGradeToPoints(1.0), 14);
  assert.equal(convertGradeToPoints(2.0), 11);
  assert.equal(convertGradeToPoints(4.0), 5);

  assert.ok(getOberstufeRating(14).includes('Sehr gut'));
  assert.ok(getOberstufeRating(4).includes('Unterkurs'));
});

test('Zielnoten-Rechner: Berechnet die benötigte Klausurnote korrekt', () => {
  // Aktueller Schnitt 2,5 mit Gewicht 3, Ziel 2,0 mit Klausurgewicht 1:
  // (2,0 * 4 - 2,5 * 3) / 1 = (8 - 7,5) / 1 = 0,5 -> nicht realistisch in 1 Klausur
  const outcome1 = calculateTargetGrade(2.5, 3, 2.0, 1);
  assert.equal(outcome1.isRealistic, false);

  // Aktueller Schnitt 2,5 mit Gewicht 1, Ziel 2,0 mit Klausurgewicht 1:
  // (2,0 * 2 - 2,5 * 1) / 1 = 1,5 -> Note 1,5 benötigt
  const outcome2 = calculateTargetGrade(2.5, 1, 2.0, 1);
  assert.equal(outcome2.isRealistic, true);
  assert.equal(outcome2.neededGrade, 1.5);
  assert.equal(outcome2.formattedNeededGrade, '1,50');
});

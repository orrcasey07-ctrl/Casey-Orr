/**
 * NotenPilot - Rechner-Kernlogik (Pure Calculation & Validation Logic)
 * 
 * Berechnungsregeln:
 * - Deutsches Notensystem: 1,0 (sehr gut) bis 6,0 (ungenügend)
 * - Komma und Punkt als Dezimaltrennzeichen zulässig (z.B. 1,7 oder 1.7)
 * - Einfacher Durchschnitt = Summe aller Noten / Anzahl der Noten
 * - Gewichteter Durchschnitt = Summe(Note * Gewichtung) / Summe aller Gewichtungen
 * - Ausgabeformatierung nach deutscher Zahlennorm (z.B. 2,33)
 */

export interface GradeRowInput {
  id?: string;
  subject?: string;
  gradeStr: string;
  weightStr?: string;
}

export interface ValidationSuccessRow {
  index: number;
  subject: string;
  grade: number;
  weight: number;
}

export interface CalculationResult {
  success: true;
  average: number;
  formattedAverage: string;
  count: number;
  isWeighted: boolean;
  totalWeight: number;
  verbalRating: string;
  breakdown: Array<{
    index: number;
    subject: string;
    gradeFormatted: string;
    weightFormatted: string;
  }>;
}

export interface CalculationError {
  success: false;
  errors: string[];
}

export type CalculationOutcome = CalculationResult | CalculationError;

export const MIN_GRADE = 1.0;
export const MAX_GRADE = 6.0;
export const MIN_WEIGHT = 0.01;
export const MAX_WEIGHT = 100.0;

/**
 * Parst eine Noteneingabe mit Komma oder Punkt in eine Zahl.
 */
export function parseGermanNumber(val: string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  const cleaned = val.trim().replace(',', '.');
  if (cleaned === '') return null;
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return null;
  return num;
}

/**
 * Gibt eine verbale Einstufung nach üblicher deutscher Notenkonvention zurück.
 */
export function getGermanVerbalRating(average: number): string {
  if (average <= 1.5) return 'Sehr gut';
  if (average <= 2.5) return 'Gut';
  if (average <= 3.5) return 'Befriedigend';
  if (average <= 4.0) return 'Ausreichend';
  if (average <= 5.0) return 'Mangelhaft';
  return 'Ungenügend';
}

/**
 * Formatiert eine Zahl nach deutscher Konvention mit 2 Nachkommastellen.
 */
export function formatGermanNumber(val: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(val);
}

/**
 * Validiert die Zeileneingaben und berechnet den Durchschnitt.
 */
export function calculateGradeAverage(
  rows: GradeRowInput[],
  isWeighted: boolean
): CalculationOutcome {
  if (!rows || rows.length === 0) {
    return {
      success: false,
      errors: ['Bitte füge mindestens eine Notenzeile hinzu.'],
    };
  }

  const errors: string[] = [];
  const validRows: ValidationSuccessRow[] = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const subjectName = (row.subject || '').trim() || `Fach ${rowNum}`;
    const rawGrade = (row.gradeStr || '').trim();

    if (rawGrade === '') {
      errors.push(`Zeile ${rowNum} (${subjectName}): Bitte gib eine Note ein.`);
      return;
    }

    const parsedGrade = parseGermanNumber(rawGrade);
    if (parsedGrade === null) {
      errors.push(
        `Zeile ${rowNum} (${subjectName}): "${rawGrade}" ist keine gültige Note. Erlaubt sind Zahlen von 1,0 bis 6,0.`
      );
      return;
    }

    if (parsedGrade < MIN_GRADE || parsedGrade > MAX_GRADE) {
      errors.push(
        `Zeile ${rowNum} (${subjectName}): Die Note ${formatGermanNumber(
          parsedGrade
        )} liegt außerhalb des Bereichs von 1,0 bis 6,0.`
      );
      return;
    }

    let parsedWeight = 1.0;
    if (isWeighted) {
      const rawWeight = (row.weightStr || '').trim();
      if (rawWeight === '') {
        errors.push(
          `Zeile ${rowNum} (${subjectName}): Bitte gib eine Gewichtung ein oder deaktiviere die gewichtete Berechnung.`
        );
        return;
      }

      const numWeight = parseGermanNumber(rawWeight);
      if (numWeight === null || numWeight <= 0) {
        errors.push(
          `Zeile ${rowNum} (${subjectName}): Die Gewichtung muss eine Zahl größer als 0 sein (z.B. 1 oder 2).`
        );
        return;
      }

      if (numWeight > MAX_WEIGHT) {
        errors.push(
          `Zeile ${rowNum} (${subjectName}): Die Gewichtung darf höchstens ${MAX_WEIGHT} betragen.`
        );
        return;
      }

      parsedWeight = numWeight;
    }

    validRows.push({
      index: rowNum,
      subject: subjectName,
      grade: parsedGrade,
      weight: parsedWeight,
    });
  });

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  if (validRows.length === 0) {
    return {
      success: false,
      errors: ['Es wurden keine gültigen Noten zur Berechnung gefunden.'],
    };
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const row of validRows) {
    weightedSum += row.grade * row.weight;
    totalWeight += row.weight;
  }

  if (totalWeight <= 0) {
    return {
      success: false,
      errors: ['Die Gesamtsumme aller Gewichtungen muss größer als 0 sein.'],
    };
  }

  const average = weightedSum / totalWeight;

  return {
    success: true,
    average,
    formattedAverage: formatGermanNumber(average, 2),
    count: validRows.length,
    isWeighted,
    totalWeight,
    verbalRating: getGermanVerbalRating(average),
    breakdown: validRows.map((r) => ({
      index: r.index,
      subject: r.subject,
      gradeFormatted: formatGermanNumber(r.grade, 2),
      weightFormatted: formatGermanNumber(r.weight, 2),
    })),
  };
}

/**
 * Erzeugt einen formatierten Text für die Zwischenablage.
 */
export function generateClipboardText(result: CalculationResult): string {
  const typeStr = result.isWeighted
    ? 'Gewichteter Notendurchschnitt'
    : 'Einfacher Notendurchschnitt';
  const lines: string[] = [
    `NotenPilot – ${typeStr}: ${result.formattedAverage} (${result.verbalRating})`,
    `Berücksichtigte Noten: ${result.count}`,
  ];

  if (result.isWeighted) {
    lines.push(`Gesamtgewichtung: ${formatGermanNumber(result.totalWeight, 2)}`);
  }

  lines.push('Fächerübersicht:');
  result.breakdown.forEach((b) => {
    if (result.isWeighted) {
      lines.push(` • ${b.subject}: Note ${b.gradeFormatted} (Gewichtung: ${b.weightFormatted})`);
    } else {
      lines.push(` • ${b.subject}: Note ${b.gradeFormatted}`);
    }
  });

  lines.push('Berechnet mit NotenPilot (kostenlos online ohne Registrierung).');
  return lines.join('\n');
}

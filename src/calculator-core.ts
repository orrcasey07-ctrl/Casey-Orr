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

export interface CalculatedAverageData {
  average: number;
  formattedAverage: string;
  count: number;
  isWeighted: boolean;
  totalWeight: number;
  rating: string;
  verbalRating: string;
  breakdown: Array<{
    subject: string;
    grade: number;
    weight: number;
  }>;
}

export function calculateAverageResult(
  items: Array<{ subject: string; grade: number; weight: number }>,
  isWeighted: boolean
): CalculatedAverageData {
  if (!items || items.length === 0) {
    throw new Error('Bitte füge mindestens eine Notenzeile hinzu.');
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const item of items) {
    const w = isWeighted ? item.weight : 1;
    weightedSum += item.grade * w;
    totalWeight += w;
  }

  if (totalWeight <= 0) {
    throw new Error('Die Gesamtsumme aller Gewichtungen muss größer als 0 sein.');
  }

  const average = weightedSum / totalWeight;
  const rating = getGermanVerbalRating(average);

  return {
    average,
    formattedAverage: formatGermanNumber(average, 2),
    count: items.length,
    isWeighted,
    totalWeight,
    rating,
    verbalRating: rating,
    breakdown: items.map((i) => ({
      subject: i.subject,
      grade: i.grade,
      weight: isWeighted ? i.weight : 1,
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

/**
 * Konvertiert gymnasiale Oberstufen-Notenpunkte (0 bis 15 Punkte)
 * in eine Dezimalnote nach offiziellem KMK-Schlüssel.
 * Formel: Note = (17 - Punkte) / 3
 */
export function convertPointsToGrade(points: number): number {
  if (points <= 0) return 6.0;
  if (points >= 15) return 0.67; // 1+
  const note = (17 - points) / 3;
  return Math.round(note * 100) / 100;
}

/**
 * Konvertiert eine Dezimalnote (1,0 bis 6,0) in Oberstufen-Notenpunkte (0 bis 15).
 */
export function convertGradeToPoints(grade: number): number {
  if (grade <= 0.8) return 15;
  if (grade >= 5.8) return 0;
  const pts = Math.round(17 - 3 * grade);
  return Math.max(0, Math.min(15, pts));
}

/**
 * Verbale Beurteilung für Oberstufenpunkte
 */
export function getOberstufeRating(points: number): string {
  if (points >= 13) return 'Sehr gut (1)';
  if (points >= 10) return 'Gut (2)';
  if (points >= 7) return 'Befriedigend (3)';
  if (points >= 5) return 'Ausreichend (4, bestanden)';
  if (points >= 1) return 'Mangelhaft (5, Unterkurs)';
  return 'Ungenügend (6, 0 Punkte)';
}

export interface TargetGradeOutcome {
  neededGrade: number;
  formattedNeededGrade: string;
  isRealistic: boolean;
  message: string;
}

/**
 * Berechnet, welche Note in der nächsten Prüfung benötigt wird, um den Wunschschnitt zu erreichen.
 * Formel: Benötigte Note = ((Ziel * (BisherigesGewicht + NeuesGewicht)) - (AktuellerSchnitt * BisherigesGewicht)) / NeuesGewicht
 */
export function calculateTargetGrade(
  currentAvg: number,
  currentWeight: number,
  targetAvg: number,
  nextExamWeight: number
): TargetGradeOutcome {
  const totalWeight = currentWeight + nextExamWeight;
  const needed = (targetAvg * totalWeight - currentAvg * currentWeight) / nextExamWeight;
  const rounded = Math.round(needed * 100) / 100;

  let isRealistic = true;
  let message = `Du benötigst in der nächsten Prüfung eine ${formatGermanNumber(rounded, 2)} oder besser.`;

  if (rounded < 1.0) {
    isRealistic = false;
    message = `Selbst mit einer 1,0 erreichst du rechnerisch nur ${(
      (currentAvg * currentWeight + 1.0 * nextExamWeight) /
      totalWeight
    ).toFixed(2).replace('.', ',')}. Der Wunschschnitt ist in einer einzigen Klausur leider nicht mehr möglich.`;
  } else if (rounded > 6.0) {
    isRealistic = true;
    message = `Dein aktueller Schnitt ist so gut, dass du das Ziel selbst mit einer 6,0 erreichst!`;
  }

  return {
    neededGrade: rounded,
    formattedNeededGrade: formatGermanNumber(Math.max(1.0, Math.min(6.0, rounded)), 2),
    isRealistic,
    message,
  };
}

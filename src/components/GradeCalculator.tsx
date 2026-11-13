import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  calculateAverageResult,
  parseGermanNumber,
  formatGermanNumber,
  convertPointsToGrade,
  convertGradeToPoints,
  getOberstufeRating,
  calculateTargetGrade,
  TargetGradeOutcome,
} from '../calculator-core';
import { saveGradeCalculation } from '../lib/studentData';
import {
  Plus,
  Trash2,
  RotateCcw,
  Calculator,
  Copy,
  Check,
  Bookmark,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Target,
  ArrowRight,
  HelpCircle,
  Award,
} from 'lucide-react';

export type CalcMode = 'school' | 'oberstufe' | 'target_grade';

interface RowState {
  id: number;
  subject: string;
  grade: string;
  weight: string;
}

interface GradeCalculatorProps {
  openAuthModal: () => void;
  onSavedGradeSuccess?: () => void;
}

const COMMON_GERMAN_SUBJECTS = [
  'Mathematik',
  'Deutsch',
  'Englisch',
  'Biologie',
  'Geschichte',
  'Physik',
  'Chemie',
  'Geographie',
  'Informatik',
  'Wirtschaft',
];

export const GradeCalculator: React.FC<GradeCalculatorProps> = ({ openAuthModal, onSavedGradeSuccess }) => {
  const { user } = useAuth();

  // Mode: Classic School (1.0-6.0), Oberstufe (0-15 Points), or Target Grade Rechner
  const [mode, setMode] = useState<CalcMode>('school');

  // School / Oberstufe rows
  const [isWeighted, setIsWeighted] = useState(false);
  const [rows, setRows] = useState<RowState[]>([
    { id: 1, subject: '', grade: '', weight: '1' },
    { id: 2, subject: '', grade: '', weight: '1' },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [errorInputIds, setErrorInputIds] = useState<number[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calculateAverageResult> | null>(null);
  const [oberstufeAveragePoints, setOberstufeAveragePoints] = useState<number | null>(null);
  const [unterkursCount, setUnterkursCount] = useState<number>(0);
  const [isStale, setIsStale] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savingGrade, setSavingGrade] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Target Grade (Wunschschnitt-Rechner) state
  const [currentAvgInput, setCurrentAvgInput] = useState('');
  const [currentWeightInput, setCurrentWeightInput] = useState('1');
  const [targetAvgInput, setTargetAvgInput] = useState('');
  const [nextExamWeightInput, setNextExamWeightInput] = useState('1');
  const [targetOutcome, setTargetOutcome] = useState<TargetGradeOutcome | null>(null);
  const [targetErrors, setTargetErrors] = useState<string[]>([]);

  // Row modifications
  const addRow = (initialSubject = '') => {
    const nextId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: nextId, subject: initialSubject, grade: '', weight: '1' }]);
    if (result) setIsStale(true);
  };

  const removeRow = (id: number) => {
    if (rows.length <= 1) {
      setErrors(['Es muss mindestens eine Notenzeile im Rechner vorhanden sein.']);
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
    if (result) setIsStale(true);
  };

  const updateRow = (id: number, field: keyof RowState, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    if (errorInputIds.includes(id)) {
      setErrorInputIds(errorInputIds.filter((item) => item !== id));
    }
    if (result) setIsStale(true);
  };

  const handleQuickAddSubject = (subjectName: string) => {
    const emptyRow = rows.find((r) => !r.subject.trim());
    if (emptyRow) {
      updateRow(emptyRow.id, 'subject', subjectName);
    } else {
      addRow(subjectName);
    }
  };

  const handleReset = () => {
    setRows([
      { id: 1, subject: '', grade: '', weight: '1' },
      { id: 2, subject: '', grade: '', weight: '1' },
    ]);
    setIsWeighted(false);
    setErrors([]);
    setErrorInputIds([]);
    setResult(null);
    setOberstufeAveragePoints(null);
    setUnterkursCount(0);
    setIsStale(false);
    setShowSaveDialog(false);
  };

  const loadExample = () => {
    setErrors([]);
    setErrorInputIds([]);
    setIsWeighted(true);

    if (mode === 'oberstufe') {
      setRows([
        { id: 1, subject: 'Mathematik (LK)', grade: '12', weight: '2' },
        { id: 2, subject: 'Deutsch (GK)', grade: '13', weight: '1' },
        { id: 3, subject: 'Englisch (LK)', grade: '11', weight: '2' },
        { id: 4, subject: 'Geschichte (GK)', grade: '10', weight: '1' },
      ]);
      const calcResult = calculateAverageResult(
        [
          { subject: 'Mathematik (LK)', grade: convertPointsToGrade(12), weight: 2 },
          { subject: 'Deutsch (GK)', grade: convertPointsToGrade(13), weight: 1 },
          { subject: 'Englisch (LK)', grade: convertPointsToGrade(11), weight: 2 },
          { subject: 'Geschichte (GK)', grade: convertPointsToGrade(10), weight: 1 },
        ],
        true
      );
      const ptsWeighted = (12 * 2 + 13 * 1 + 11 * 2 + 10 * 1) / (2 + 1 + 2 + 1);
      setOberstufeAveragePoints(ptsWeighted);
      setUnterkursCount(0);
      setResult(calcResult);
      setIsStale(false);
    } else {
      setRows([
        { id: 1, subject: 'Mathematik', grade: '2,0', weight: '2' },
        { id: 2, subject: 'Deutsch', grade: '1,7', weight: '1' },
        { id: 3, subject: 'Englisch', grade: '2,3', weight: '1' },
      ]);
      const res = calculateAverageResult(
        [
          { subject: 'Mathematik', grade: 2.0, weight: 2 },
          { subject: 'Deutsch', grade: 1.7, weight: 1 },
          { subject: 'Englisch', grade: 2.3, weight: 1 },
        ],
        true
      );
      setResult(res);
      setOberstufeAveragePoints(null);
      setUnterkursCount(0);
      setIsStale(false);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setErrorInputIds([]);
    setSaveSuccessMsg(null);

    const validationErrors: string[] = [];
    const invalidIds: number[] = [];
    const validData: Array<{ subject: string; grade: number; weight: number; rawPoints?: number }> = [];
    let detectedUnterkurse = 0;

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const subjectName = row.subject.trim() || `Fach ${rowNum}`;
      const rawGrade = row.grade.trim();

      if (!rawGrade) {
        validationErrors.push(`Zeile ${rowNum} (${subjectName}): Bitte gib ${mode === 'oberstufe' ? 'Notenpunkte (0-15)' : 'eine Note (1,0-6,0)'} ein.`);
        invalidIds.push(row.id);
        return;
      }

      const numVal = parseGermanNumber(rawGrade);
      if (numVal === null) {
        validationErrors.push(`Zeile ${rowNum} (${subjectName}): "${rawGrade}" ist keine gültige Zahl.`);
        invalidIds.push(row.id);
        return;
      }

      let gradeForCalc = numVal;

      if (mode === 'oberstufe') {
        if (numVal < 0 || numVal > 15) {
          validationErrors.push(`Zeile ${rowNum} (${subjectName}): Punkte müssen zwischen 0 und 15 liegen.`);
          invalidIds.push(row.id);
          return;
        }
        if (numVal < 5) {
          detectedUnterkurse += 1;
        }
        gradeForCalc = convertPointsToGrade(numVal);
      } else {
        if (numVal < 1.0 || numVal > 6.0) {
          validationErrors.push(`Zeile ${rowNum} (${subjectName}): Note ${formatGermanNumber(numVal)} liegt außerhalb von 1,0 bis 6,0.`);
          invalidIds.push(row.id);
          return;
        }
      }

      let parsedWeight = 1.0;
      if (isWeighted) {
        const rawWeight = row.weight.trim();
        if (!rawWeight) {
          validationErrors.push(`Zeile ${rowNum} (${subjectName}): Bitte gib eine Gewichtung ein.`);
          invalidIds.push(row.id);
          return;
        }

        const numWeight = parseGermanNumber(rawWeight);
        if (numWeight === null || numWeight <= 0) {
          validationErrors.push(`Zeile ${rowNum} (${subjectName}): Die Gewichtung muss größer als 0 sein.`);
          invalidIds.push(row.id);
          return;
        }

        if (numWeight > 100) {
          validationErrors.push(`Zeile ${rowNum} (${subjectName}): Die Gewichtung darf maximal 100 betragen.`);
          invalidIds.push(row.id);
          return;
        }

        parsedWeight = numWeight;
      }

      validData.push({
        subject: subjectName,
        grade: gradeForCalc,
        weight: parsedWeight,
        rawPoints: mode === 'oberstufe' ? numVal : undefined,
      });
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setErrorInputIds(invalidIds);
      setResult(null);
      return;
    }

    try {
      const calcResult = calculateAverageResult(validData, isWeighted);
      setResult(calcResult);
      setUnterkursCount(detectedUnterkurse);

      if (mode === 'oberstufe') {
        let ptsWeightedSum = 0;
        let wTotal = 0;
        validData.forEach((d) => {
          const w = isWeighted ? d.weight : 1;
          ptsWeightedSum += (d.rawPoints ?? 0) * w;
          wTotal += w;
        });
        setOberstufeAveragePoints(wTotal > 0 ? ptsWeightedSum / wTotal : null);
      } else {
        setOberstufeAveragePoints(null);
      }

      setIsStale(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Berechnungsfehler';
      setErrors([msg]);
      setResult(null);
    }
  };

  const handleTargetGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTargetErrors([]);
    setTargetOutcome(null);

    const errs: string[] = [];
    const curAvg = parseGermanNumber(currentAvgInput);
    const curW = parseGermanNumber(currentWeightInput);
    const tgtAvg = parseGermanNumber(targetAvgInput);
    const nextW = parseGermanNumber(nextExamWeightInput);

    if (curAvg === null || curAvg < 1.0 || curAvg > 6.0) {
      errs.push('Aktueller Notenschnitt muss zwischen 1,0 und 6,0 liegen.');
    }
    if (curW === null || curW <= 0) {
      errs.push('Bisherige Gesamtgewichtung muss größer als 0 sein.');
    }
    if (tgtAvg === null || tgtAvg < 1.0 || tgtAvg > 6.0) {
      errs.push('Wunsch-Notenschnitt muss zwischen 1,0 und 6,0 liegen.');
    }
    if (nextW === null || nextW <= 0) {
      errs.push('Gewichtung der nächsten Prüfung muss größer als 0 sein.');
    }

    if (errs.length > 0) {
      setTargetErrors(errs);
      return;
    }

    const outcome = calculateTargetGrade(curAvg!, curW!, tgtAvg!, nextW!);
    setTargetOutcome(outcome);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const isOb = mode === 'oberstufe';
    const typeStr = isOb
      ? `Gymnasiale Oberstufe: ${oberstufeAveragePoints ? formatGermanNumber(oberstufeAveragePoints, 2) : ''} Punkte (Abitur-Schnitt: ${result.formattedAverage})`
      : result.isWeighted
      ? 'Gewichteter Notendurchschnitt'
      : 'Einfacher Notendurchschnitt';

    const textLines = [
      `NotenPilot – ${typeStr}: ${result.formattedAverage} (${result.rating})`,
      `Berücksichtigte Leistungen: ${result.count}`,
      ...(result.isWeighted ? [`Gesamtgewichtung: ${formatGermanNumber(result.totalWeight, 2)}`] : []),
      ...(isOb && unterkursCount > 0 ? [`Unterkurse (< 5 P): ${unterkursCount}`] : []),
      '',
      'Fächerübersicht:',
      ...result.breakdown.map((b) =>
        result.isWeighted
          ? ` • ${b.subject}: Note ${formatGermanNumber(b.grade, 2)} (Gewichtung: ${formatGermanNumber(b.weight, 2)})`
          : ` • ${b.subject}: Note ${formatGermanNumber(b.grade, 2)}`
      ),
      '',
      'Berechnet mit NotenPilot (kostenlos & datensparsam).',
    ];

    try {
      await navigator.clipboard.writeText(textLines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleSaveToProfile = async () => {
    if (!user || !result) return;
    if (!saveTitle.trim()) {
      setErrors(['Bitte gib einen Titel für die gespeicherte Berechnung ein (z. B. "Halbjahr 11/1").']);
      return;
    }

    setSavingGrade(true);
    try {
      await saveGradeCalculation(
        user.id,
        saveTitle.trim(),
        result.average,
        result.isWeighted,
        result.breakdown
      );
      setSaveSuccessMsg(`Berechnung "${saveTitle.trim()}" erfolgreich in deinem Konto gespeichert!`);
      setShowSaveDialog(false);
      setSaveTitle('');
      if (onSavedGradeSuccess) onSavedGradeSuccess();
    } catch {
      setErrors(['Fehler beim Speichern der Berechnung.']);
    } finally {
      setSavingGrade(false);
    }
  };

  return (
    <div className="w-full">
      {/* Mode Switcher Segmented Control */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 rounded-2xl bg-[#111412] border border-[#292F2B] max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setMode('school');
              handleReset();
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              mode === 'school'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-md shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            Klassisch (1,0 - 6,0)
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('oberstufe');
              handleReset();
            }}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              mode === 'oberstufe'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-md shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            Oberstufe (0-15 P)
          </button>

          <button
            type="button"
            onClick={() => setMode('target_grade')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              mode === 'target_grade'
                ? 'bg-[#171B18] text-white border border-[#292F2B] shadow-md shadow-black/40'
                : 'text-[#A4AAA5] hover:text-white'
            }`}
          >
            Zielnoten-Rechner
          </button>
        </div>
      </div>

      {mode === 'target_grade' ? (
        /* ================= TARGET GRADE CALCULATOR ================= */
        <div className="bg-[#111412] rounded-3xl border border-[#292F2B] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3.5 pb-6 border-b border-[#292F2B] mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] text-[#C5F82A] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Wunschschnitt-Rechner: Welche Note brauche ich?
              </h2>
              <p className="text-xs sm:text-sm text-[#A4AAA5] mt-1">
                Berechne exakt, welche Note du in der nächsten Klausur schreiben musst, um deinen Wunschschnitt zu erreichen.
              </p>
            </div>
          </div>

          <form onSubmit={handleTargetGradeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#A4AAA5] mb-2">
                  Aktueller Notenschnitt *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. 2,6"
                  value={currentAvgInput}
                  onChange={(e) => setCurrentAvgInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] font-mono transition-colors"
                />
                <span className="text-[11px] text-[#A4AAA5]/70 block mt-1.5">
                  Bisheriger Notenschnitt in diesem Fach oder Zeugnis
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#A4AAA5] mb-2">
                  Bisherige Gesamtgewichtung *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="z. B. 3"
                  value={currentWeightInput}
                  onChange={(e) => setCurrentWeightInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] font-mono transition-colors"
                />
                <span className="text-[11px] text-[#A4AAA5]/70 block mt-1.5">
                  Anzahl oder Summe der bisherigen Notengewichte
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#A4AAA5] mb-2">
                  Angestrebter Wunschschnitt *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. 2,0"
                  value={targetAvgInput}
                  onChange={(e) => setTargetAvgInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] font-mono transition-colors"
                />
                <span className="text-[11px] text-[#A4AAA5]/70 block mt-1.5">
                  Zielnote zum Schuljahresende oder Semester
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[#A4AAA5] mb-2">
                  Gewichtung der nächsten Prüfung *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  placeholder="z. B. 1 oder 2"
                  value={nextExamWeightInput}
                  onChange={(e) => setNextExamWeightInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] font-mono transition-colors"
                />
                <span className="text-[11px] text-[#A4AAA5]/70 block mt-1.5">
                  Gewicht der anstehenden Schulaufgabe / Klausur (oft 1 oder 2)
                </span>
              </div>
            </div>

            {targetErrors.length > 0 && (
              <div className="p-4 bg-red-950/40 border border-red-800/80 text-red-200 rounded-xl text-xs space-y-1">
                {targetErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-[#C5F82A]/20 transition-all duration-300 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Benötigte Note berechnen</span>
            </button>
          </form>

          {targetOutcome && (
            <div className="mt-8 p-6 bg-[#171B18] border border-[#292F2B] rounded-2xl animate-fadeIn">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#C5F82A] block mb-2">
                Ergebnis Zielnoten-Rechnung
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono mb-2">
                Note {targetOutcome.formattedNeededGrade}
              </div>
              <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                {targetOutcome.message}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ================= MAIN CALCULATOR (SCHOOL & OBERSTUFE) ================= */
        <div className="bg-[#111412] rounded-3xl border border-[#292F2B] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#292F2B] gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-[#C5F82A]" />
                <span>{mode === 'oberstufe' ? 'Oberstufen-Punkte eingeben (0 - 15 P)' : 'Deine Noten eingeben'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#A4AAA5] mt-1">
                {mode === 'oberstufe'
                  ? 'Trage deine Notenpunkte ein. NotenPilot berechnet den Punkteschnitt und die offizielle Abitur-Dezimalnote.'
                  : 'Trage deine Noten ein. Dezimalkomma (z. B. 2,3) und Punkt (z. B. 2.3) werden beide unterstützt.'}
              </p>
            </div>
            <button
              type="button"
              onClick={loadExample}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#171B18] hover:border-[#C5F82A] border border-[#292F2B] rounded-xl transition-all duration-300 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5F82A]" />
              <span>Beispiel laden</span>
            </button>
          </div>

          {/* Quick-add Subject Chips */}
          <div className="py-4 border-b border-[#292F2B]/60">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#A4AAA5] mb-2">
              Häufige Schulfächer schnell einfügen:
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_GERMAN_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => handleQuickAddSubject(sub)}
                  className="px-3 py-1.5 text-xs bg-[#171B18] hover:bg-[#292F2B] text-[#A4AAA5] hover:text-white border border-[#292F2B] rounded-lg transition-colors cursor-pointer"
                >
                  + {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Weighted Toggle Box */}
          <div className="mt-6 p-4 bg-[#171B18] border border-[#292F2B] rounded-2xl">
            <label className="flex items-start gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isWeighted}
                onChange={(e) => {
                  setIsWeighted(e.target.checked);
                  if (result) setIsStale(true);
                }}
                className="w-5 h-5 mt-0.5 accent-[#C5F82A] rounded cursor-pointer shrink-0"
              />
              <div className="text-xs">
                <span className="font-bold text-white block text-sm">Gewichtete Berechnung verwenden</span>
                <span className="text-[#A4AAA5] block mt-0.5 leading-relaxed">
                  {mode === 'oberstufe'
                    ? 'Aktiviere diese Option für Leistungskurse (doppelt gewichtet) oder ungleiche Klausuren.'
                    : 'Aktiviere diese Option, wenn Noten unterschiedlich stark zählen (z. B. Hauptfächer doppelt oder Klausuren stärker als mündlich).'}
                </span>
              </div>
            </label>
          </div>

          {/* Form */}
          <form onSubmit={handleCalculate} className="mt-8">
            {/* Desktop Header */}
            <div className="hidden sm:grid grid-cols-[2fr_1.2fr_1.2fr_44px] gap-3 pb-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#A4AAA5]">
              <div>Fach (optional)</div>
              <div>{mode === 'oberstufe' ? 'Punkte * (0 - 15)' : 'Note * (1,0 - 6,0)'}</div>
              <div>Gewichtung</div>
              <div className="text-right">Aktion</div>
            </div>

            {/* Rows */}
            <div className="space-y-3">
              {rows.map((row, index) => {
                const hasError = errorInputIds.includes(row.id);
                return (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 sm:grid-cols-[2fr_1.2fr_1.2fr_44px] gap-2.5 sm:gap-3 p-3.5 sm:p-0 bg-[#171B18] sm:bg-transparent rounded-2xl border border-[#292F2B] sm:border-0"
                  >
                    <div>
                      <label className="block sm:hidden text-xs font-semibold text-[#A4AAA5] mb-1">
                        Fach (optional)
                      </label>
                      <input
                        type="text"
                        value={row.subject}
                        onChange={(e) => updateRow(row.id, 'subject', e.target.value)}
                        placeholder={`z. B. Fach ${index + 1}`}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block sm:hidden text-xs font-semibold text-[#A4AAA5] mb-1">
                        {mode === 'oberstufe' ? 'Punkte * (0 - 15)' : 'Note * (1,0 - 6,0)'}
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        required
                        value={row.grade}
                        onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                        placeholder={mode === 'oberstufe' ? 'z. B. 12' : 'z. B. 2,0'}
                        className={`w-full px-3.5 py-2.5 text-sm bg-[#171B18] border rounded-xl font-mono focus:outline-none transition-colors ${
                          hasError
                            ? 'border-red-500 bg-red-950/30 text-white'
                            : 'border-[#292F2B] text-white focus:border-[#C5F82A]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block sm:hidden text-xs font-semibold text-[#A4AAA5] mb-1">
                        Gewichtung
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        max="100"
                        disabled={!isWeighted}
                        value={row.weight}
                        onChange={(e) => updateRow(row.id, 'weight', e.target.value)}
                        placeholder="1"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#171B18] border border-[#292F2B] text-white rounded-xl font-mono focus:outline-none focus:border-[#C5F82A] disabled:opacity-40 transition-colors"
                      />
                    </div>

                    <div className="flex justify-end items-center">
                      <button
                        type="button"
                        disabled={rows.length <= 1}
                        onClick={() => removeRow(row.id)}
                        title={rows.length <= 1 ? 'Mindestens eine Notenzeile erforderlich' : 'Zeile entfernen'}
                        className="w-10 h-10 flex items-center justify-center text-[#A4AAA5] hover:text-red-400 hover:bg-red-950/30 disabled:opacity-20 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-[#292F2B]">
              <button
                type="button"
                onClick={() => addRow()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#171B18] hover:border-[#C5F82A] border border-[#292F2B] rounded-xl transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#C5F82A]" />
                <span>+ Weitere Note hinzufügen</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#A4AAA5] hover:text-white hover:bg-[#171B18] rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Zurücksetzen</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-xl shadow-lg shadow-[#C5F82A]/20 transition-all duration-300 cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Durchschnitt berechnen</span>
                </button>
              </div>
            </div>
          </form>

          {/* Error Container */}
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-950/40 border border-red-800/80 rounded-2xl text-red-200 text-xs sm:text-sm space-y-1">
              <div className="font-bold flex items-center gap-2 text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Bitte korrigiere folgende Eingaben:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-red-300/90 font-mono text-xs">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Stale Warning */}
          {isStale && result && (
            <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Eingaben wurden geändert. Klicke erneut auf <strong>&bdquo;Durchschnitt berechnen&ldquo;</strong>, um das Ergebnis zu aktualisieren.
              </span>
            </div>
          )}

          {/* Success Save Notice */}
          {saveSuccessMsg && (
            <div className="mt-4 p-3.5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-[#C5F82A] shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="mt-8 p-6 sm:p-8 bg-[#171B18] border border-[#292F2B] rounded-2xl shadow-2xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#292F2B] gap-4">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#A4AAA5] uppercase tracking-wider block">
                    {mode === 'oberstufe' ? 'Abitur-Dezimalnote & Punkteschnitt' : 'Dein berechneter Notendurchschnitt'}
                  </span>
                  <div className="flex items-baseline gap-3.5 mt-2">
                    <span className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tight">
                      {result.formattedAverage}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#090B0A] bg-[#C5F82A] px-3 py-1 rounded-lg">
                      {result.rating}
                    </span>
                    {oberstufeAveragePoints !== null && (
                      <span className="text-xs sm:text-sm font-bold text-white bg-[#090B0A] border border-[#292F2B] px-3 py-1 rounded-lg font-mono">
                        Ø {formatGermanNumber(oberstufeAveragePoints, 2)} Punkte
                      </span>
                    )}
                  </div>
                </div>

                {/* Clean unboxed metadata with separators */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#A4AAA5]">
                  <span>{result.isWeighted ? 'Gewichteter Schnitt' : 'Einfacher Schnitt'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{result.count} Leistungen</span>
                  {result.isWeighted && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Gewicht: {formatGermanNumber(result.totalWeight, 2)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Unterkurs warning for Oberstufe */}
              {mode === 'oberstufe' && unterkursCount > 0 && (
                <div className="mt-4 p-4 bg-rose-950/40 border border-rose-800/80 text-rose-200 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-300">
                      Achtung: {unterkursCount} {unterkursCount === 1 ? 'Unterkurs' : 'Unterkurse'} (&lt; 5 Punkte) gefunden!
                    </strong>
                    <div className="text-rose-300/80 mt-0.5">
                      In der gymnasialen Oberstufe darf nur eine begrenzte Zahl von Unterkursen (je nach Bundesland max. 7-8 Kurse) in die Abiturwertung eingebracht werden.
                    </div>
                  </div>
                </div>
              )}

              {/* Table Breakdown */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#292F2B] text-[#A4AAA5] font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Fach</th>
                      <th className="py-2.5 px-3">{mode === 'oberstufe' ? 'Note (KMK)' : 'Note'}</th>
                      {isWeighted && <th className="py-2.5 px-3">Gewichtung</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#292F2B]/60 text-white font-mono">
                    {result.breakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#090B0A]/40 transition-colors">
                        <td className="py-2.5 px-3 text-[#A4AAA5]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-white">{item.subject}</td>
                        <td className="py-2.5 px-3 text-[#C5F82A]">{formatGermanNumber(item.grade, 2)}</td>
                        {isWeighted && (
                          <td className="py-2.5 px-3 text-[#A4AAA5]">
                            {formatGermanNumber(item.weight, 2)}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Result Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-[#292F2B]">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#090B0A] hover:bg-[#292F2B] border border-[#292F2B] rounded-xl transition-all duration-300 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#C5F82A]" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'In die Zwischenablage kopiert!' : 'Ergebnis kopieren'}</span>
                </button>

                {user ? (
                  <div>
                    {showSaveDialog ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="z. B. Halbjahr 11/1"
                          value={saveTitle}
                          onChange={(e) => setSaveTitle(e.target.value)}
                          className="px-3.5 py-2 text-xs bg-[#090B0A] border border-[#292F2B] text-white rounded-xl focus:outline-none focus:border-[#C5F82A]"
                        />
                        <button
                          type="button"
                          disabled={savingGrade}
                          onClick={handleSaveToProfile}
                          className="px-4 py-2 bg-[#C5F82A] text-[#090B0A] text-xs font-bold rounded-xl hover:bg-white disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {savingGrade ? 'Speichern...' : 'Bestätigen'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSaveDialog(false)}
                          className="px-3 py-2 text-xs text-[#A4AAA5] hover:text-white"
                        >
                          Abbrechen
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSaveDialog(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-xl transition-all duration-300 cursor-pointer shadow-lg shadow-[#C5F82A]/15"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>In Mein NotenPilot speichern</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#090B0A] hover:border-[#C5F82A] border border-[#292F2B] rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-[#C5F82A]" />
                    <span>Anmelden zum dauerhaften Speichern</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#A4AAA5]/70 mt-4 leading-relaxed font-mono">
                Hinweis: Das Ergebnis dient der Orientierung. Die offizielle Notenberechnung kann je nach Schule, Hochschule oder Landesprüfungsordnung abweichen.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

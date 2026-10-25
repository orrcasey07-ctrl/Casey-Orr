import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject, deleteSubject, getSavedGrades, deleteSavedGrade } from '../lib/studentData';
import { Subject, SavedGrade } from '../lib/supabase';
import { formatGermanNumber } from '../calculator-core';
import { Layers, Plus, Trash2, Award, Bookmark, AlertCircle, ArrowUpRight } from 'lucide-react';

interface SubjectsViewProps {
  onOpenCalculator: () => void;
}

const PRESET_COLORS = ['#123B70', '#176B48', '#855302', '#6B21A8', '#0E7490', '#BE185D', '#374151'];

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onOpenCalculator }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);
  const [loading, setLoading] = useState(true);

  // New subject state
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [subs, grades] = await Promise.all([
        getSubjects(user.id),
        getSavedGrades(user.id),
      ]);
      setSubjects(subs);
      setSavedGrades(grades);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) return;
    if (!newName.trim()) {
      setErrorMsg('Bitte gib einen Fachnamen ein.');
      return;
    }

    let parsedTarget: number | null = null;
    if (newTarget.trim()) {
      const targetNum = parseFloat(newTarget.replace(',', '.'));
      if (isNaN(targetNum) || targetNum < 1.0 || targetNum > 6.0) {
        setErrorMsg('Die Zielnote muss zwischen 1,0 und 6,0 liegen.');
        return;
      }
      parsedTarget = targetNum;
    }

    try {
      const created = await createSubject(user.id, newName.trim(), parsedTarget, newColor);
      setSubjects([...subjects, created]);
      setNewName('');
      setNewTarget('');
    } catch {
      setErrorMsg('Fehler beim Anlegen des Fachs.');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!user) return;
    await deleteSubject(user.id, id);
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleDeleteGrade = async (id: string) => {
    if (!user) return;
    await deleteSavedGrade(user.id, id);
    setSavedGrades(savedGrades.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">Fächer & Noten-Historie</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Verwalte deine Schulfächer, persönliche Zielnoten und greife auf deine gespeicherten Notendurchschnitte zu.
          </p>
        </div>

        <button
          onClick={onOpenCalculator}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          Zum Notenrechner
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Subjects Manager (Left) + Create Subject Form & Saved Grades (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: My Subjects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center justify-between">
            <span>Deine Fächer</span>
            <span className="text-xs text-slate-400 font-normal">{subjects.length} aktiv</span>
          </h3>

          {/* Add Subject inline form */}
          <form onSubmit={handleCreateSubject} className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="font-semibold text-xs text-slate-800">Neues Fach anlegen</div>
            {errorMsg && (
              <div className="text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr] gap-2">
              <input
                type="text"
                placeholder="Fachname (z. B. Biologie)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Zielnote (z. B. 2,0)"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Color picker pills */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">Farbe:</span>
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewColor(col)}
                    style={{ backgroundColor: col }}
                    className={`w-5 h-5 rounded-full transition-transform ${
                      newColor === col ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Fach speichern
              </button>
            </div>
          </form>

          {/* Subjects list */}
          <div className="space-y-2 mt-4">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Lade Fächer...</div>
            ) : subjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Noch keine Fächer angelegt. Trage oben dein erstes Schulfach ein!
              </div>
            ) : (
              subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{sub.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {sub.target_grade ? (
                          <span>Zielnote: <strong>{formatGermanNumber(sub.target_grade, 2)}</strong></span>
                        ) : (
                          <span>Keine Zielnote hinterlegt</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(sub.id)}
                    title="Fach löschen"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Saved Grade Calculations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-700" />
              <span>Gespeicherte Notenberechnungen</span>
            </h3>
            <span className="text-xs text-slate-400 font-normal">{savedGrades.length} gespeichert</span>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Lade Berechnungen...</div>
            ) : savedGrades.length === 0 ? (
              <div className="py-12 text-center">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Noch keine Notenberechnungen gesichert.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Berechne einen Schnitt im Notenrechner und klicke auf "In Mein NotenPilot speichern".
                </p>
                <button
                  onClick={onOpenCalculator}
                  className="mt-4 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-light rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Zum Rechner
                </button>
              </div>
            ) : (
              savedGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{grade.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(grade.created_at).toLocaleDateString('de-DE')} · {grade.total_notes} Noten
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-emerald-800 tabular-nums">
                          {formatGermanNumber(grade.average, 2)}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {grade.is_weighted ? 'Gewichtet' : 'Einfach'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteGrade(grade.id)}
                        title="Eintrag löschen"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Fächer-Breakdown Accordion */}
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 divide-y divide-slate-100">
                    {grade.breakdown.map((item, idx) => (
                      <div key={idx} className="py-1 flex items-center justify-between">
                        <span>{item.subject}</span>
                        <div className="space-x-2">
                          <strong className="text-slate-900">{formatGermanNumber(item.grade, 2)}</strong>
                          {grade.is_weighted && (
                            <span className="text-slate-400">({item.weight}x)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

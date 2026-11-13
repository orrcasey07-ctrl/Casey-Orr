import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSubjects, createSubject, deleteSubject, getSavedGrades, deleteSavedGrade } from '../lib/studentData';
import { Subject, SavedGrade } from '../lib/supabase';
import { formatGermanNumber } from '../calculator-core';
import { Layers, Plus, Trash2, Award, Bookmark, AlertCircle, ArrowUpRight } from 'lucide-react';

interface SubjectsViewProps {
  onOpenCalculator: () => void;
}

const PRESET_COLORS = ['#C5F82A', '#38BDF8', '#34D399', '#F472B6', '#A78BFA', '#FBBF24', '#94A3B8'];

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
    setErrorMsg(null);
    try {
      await deleteSubject(user.id, id);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setErrorMsg('Fach konnte nicht gelöscht werden.');
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!user) return;
    setErrorMsg(null);
    try {
      await deleteSavedGrade(user.id, id);
      setSavedGrades((prev) => prev.filter((g) => g.id !== id));
    } catch {
      setErrorMsg('Noteneintrag konnte nicht gelöscht werden.');
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Top Banner */}
      <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#C5F82A]" />
            <h2 className="text-xl font-black text-white">Fächer & Noten-Historie</h2>
          </div>
          <p className="text-xs text-[#A4AAA5] mt-1">
            Verwalte deine Schulfächer, persönliche Zielnoten und greife auf deine gespeicherten Notendurchschnitte zu.
          </p>
        </div>

        <button
          onClick={onOpenCalculator}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-xl transition-all self-start sm:self-auto cursor-pointer shadow-md shadow-[#C5F82A]/20"
        >
          Zum Notenrechner
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid: Subjects Manager (Left) + Create Subject Form & Saved Grades (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: My Subjects */}
        <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-xl">
          <h3 className="font-bold text-white text-sm pb-3 border-b border-[#292F2B] flex items-center justify-between">
            <span>Deine Fächer</span>
            <span className="text-xs font-mono text-[#A4AAA5]">{subjects.length} aktiv</span>
          </h3>

          {/* Add Subject inline form */}
          <form onSubmit={handleCreateSubject} className="my-4 p-4 bg-[#171B18] rounded-xl border border-[#292F2B] space-y-3">
            <div className="font-bold text-xs text-white">Neues Fach anlegen</div>
            {errorMsg && (
              <div className="text-[11px] text-red-400 flex items-center gap-1">
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
                className="px-3 py-2 text-xs bg-[#090B0A] border border-[#292F2B] rounded-xl text-white placeholder-[#717772] focus:outline-none focus:border-[#C5F82A]"
              />
              <input
                type="text"
                placeholder="Zielnote (z. B. 2,0)"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="px-3 py-2 text-xs bg-[#090B0A] border border-[#292F2B] rounded-xl text-white placeholder-[#717772] focus:outline-none focus:border-[#C5F82A]"
              />
            </div>

            {/* Color picker pills */}
            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-[#A4AAA5] mr-1">Farbe:</span>
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setNewColor(col)}
                    style={{ backgroundColor: col }}
                    className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                      newColor === col ? 'ring-2 ring-offset-2 ring-offset-[#171B18] ring-white scale-125' : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Fach speichern
              </button>
            </div>
          </form>

          {/* Subjects list */}
          <div className="space-y-2 mt-4">
            {loading ? (
              <div className="py-6 text-center text-xs text-[#A4AAA5]">Lade Fächer...</div>
            ) : subjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#A4AAA5]">
                Noch keine Fächer angelegt. Trage oben dein erstes Schulfach ein!
              </div>
            ) : (
              subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#292F2B] hover:border-[#38413b] transition-colors bg-[#171B18]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">{sub.name}</h4>
                      <p className="text-[11px] text-[#A4AAA5]">
                        {sub.target_grade ? (
                          <span>Zielnote: <strong className="text-[#C5F82A]">{formatGermanNumber(sub.target_grade, 2)}</strong></span>
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
                    className="p-1.5 text-[#A4AAA5] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Saved Grade Calculations */}
        <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-[#292F2B]">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#C5F82A]" />
              <span>Gespeicherte Notenberechnungen</span>
            </h3>
            <span className="text-xs font-mono text-[#A4AAA5]">{savedGrades.length} gespeichert</span>
          </div>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="py-6 text-center text-xs text-[#A4AAA5]">Lade Berechnungen...</div>
            ) : savedGrades.length === 0 ? (
              <div className="py-12 text-center">
                <Award className="w-8 h-8 text-[#292F2B] mx-auto mb-2" />
                <p className="text-xs text-white font-medium">Noch keine Notenberechnungen gesichert.</p>
                <p className="text-[11px] text-[#A4AAA5] mt-1 max-w-xs mx-auto">
                  Berechne einen Schnitt im Notenrechner und klicke auf "In Mein NotenPilot speichern".
                </p>
                <button
                  onClick={onOpenCalculator}
                  className="mt-4 px-3.5 py-2 text-xs font-bold text-[#090B0A] bg-[#C5F82A] rounded-xl hover:bg-white transition-colors cursor-pointer"
                >
                  Zum Rechner
                </button>
              </div>
            ) : (
              savedGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="p-4 rounded-xl border border-[#292F2B] bg-[#171B18] hover:border-[#38413b] transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white">{grade.title}</h4>
                      <span className="text-[10px] font-mono text-[#A4AAA5]">
                        {new Date(grade.created_at).toLocaleDateString('de-DE')} · {grade.total_notes} Noten
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xl font-black text-[#C5F82A] tabular-nums">
                          {formatGermanNumber(grade.average, 2)}
                        </span>
                        <span className="block text-[10px] font-mono text-[#A4AAA5]">
                          {grade.is_weighted ? 'Gewichtet' : 'Einfach'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteGrade(grade.id)}
                        title="Eintrag löschen"
                        className="p-1.5 text-[#A4AAA5] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Fächer-Breakdown Accordion */}
                  <div className="text-[11px] text-[#A4AAA5] bg-[#090B0A] p-3 rounded-xl border border-[#292F2B] divide-y divide-[#292F2B]">
                    {grade.breakdown.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span>{item.subject}</span>
                        <div className="space-x-2 font-mono">
                          <strong className="text-white">{formatGermanNumber(item.grade, 2)}</strong>
                          {grade.is_weighted && (
                            <span className="text-[#A4AAA5]">({item.weight}x)</span>
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

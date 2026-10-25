import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, getSubjects, getExams, getStudyTasks, getSavedGrades } from '../lib/studentData';
import { StudentNote, Subject, Exam, StudyTask, SavedGrade } from '../lib/supabase';
import { ActiveTab } from './Navbar';
import { BookOpen, Layers, Calendar, CheckSquare, Plus, ArrowRight, Clock, Award, Star } from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNote?: (noteId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenNote }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [loadedNotes, loadedSubjects, loadedExams, loadedTasks, loadedGrades] = await Promise.all([
          getNotes(user.id),
          getSubjects(user.id),
          getExams(user.id),
          getStudyTasks(user.id),
          getSavedGrades(user.id),
        ]);
        setNotes(loadedNotes);
        setSubjects(loadedSubjects);
        setExams(loadedExams);
        setTasks(loadedTasks);
        setSavedGrades(loadedGrades);
      } catch {
        // error handling
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (!user) {
    return null;
  }

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const latestGrade = savedGrades.length > 0 ? savedGrades[0] : null;

  // Format upcoming exam days
  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Vergangen';
    if (diff === 0) return 'Heute';
    if (diff === 1) return 'Morgen';
    return `In ${diff} Tagen`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-primary text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{profile?.school_type || 'Schul- und Studienportal'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Willkommen zurück, {profile?.display_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hier ist dein persönlicher Überblick über deine Fächer, Noten, anstehenden Klausuren und Lernaufgaben.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('timer')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Clock className="w-4 h-4 text-primary" />
              Fokus starten
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Schnitt berechnen
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Aktiver Schnitt</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {latestGrade ? latestGrade.average.toFixed(2).replace('.', ',') : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
              {latestGrade ? latestGrade.title : 'Noch kein Schnitt gespeichert'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Fächer</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {subjects.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Angelegte Studienfächer
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Nächste Klausuren</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {exams.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Im Lernplan terminiert
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <CheckSquare className="w-4 h-4 text-purple-600" />
              <span>Offene Aufgaben</span>
            </div>
            <div className="text-2xl font-black text-slate-900 tabular-nums">
              {pendingTasks.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zu erledigen
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Recent Notes & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-slate-900 text-sm">Aktuelle Notizen</h3>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Alle anzeigen ({notes.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Notizen laden...</div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Du hast noch keine Notizen angelegt.</p>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Erste Notiz schreiben
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {notes.slice(0, 4).map((note) => {
                  const subject = subjects.find((s) => s.id === note.subject_id);
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveTab('notes');
                        if (onOpenNote) onOpenNote(note.id);
                      }}
                      className="py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {note.is_pinned && <span className="text-amber-500 mr-1.5">📌</span>}
                          {note.title}
                        </span>
                        {subject && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                          >
                            {subject.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {note.content || 'Kein Textinhalt'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('notes')}
              className="w-full py-2 text-center text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 rounded-lg transition-colors"
            >
              + Neue Notiz erstellen
            </button>
          </div>
        </div>

        {/* Right: Upcoming Exams & Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Nächste Prüfungen & Aufgaben</h3>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Lernplan öffnen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Prüfungen laden...</div>
            ) : exams.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Keine anstehenden Klausuren eingetragen.</p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Klausurtermin anlegen
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 mt-2">
                {exams.slice(0, 3).map((exam) => {
                  const subject = subjects.find((s) => s.id === exam.subject_id);
                  const countdown = getDaysUntil(exam.exam_date);
                  const isSoon = countdown.includes('Heute') || countdown.includes('Morgen') || countdown.includes('In 2 Tagen') || countdown.includes('In 3 Tagen');

                  return (
                    <div key={exam.id} className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {exam.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isSoon ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {countdown}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>Datum: {new Date(exam.exam_date).toLocaleDateString('de-DE')}</span>
                        {subject && (
                          <>
                            <span>·</span>
                            <span style={{ color: subject.color }} className="font-medium">
                              {subject.name}
                            </span>
                          </>
                        )}
                        <span>·</span>
                        <span>Gewicht: {exam.weight}x</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('planner')}
              className="w-full py-2 text-center text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 rounded-lg transition-colors"
            >
              + Klausur oder Lernaufgabe eintragen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

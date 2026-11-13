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
      <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,rgba(197,248,42,0.06),transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171B18] text-[#C5F82A] border border-[#292F2B] text-xs font-mono font-semibold mb-3">
              <Star className="w-3.5 h-3.5 text-[#C5F82A] fill-[#C5F82A]" />
              <span>{profile?.school_type || 'Schul- und Studienportal'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Willkommen zurück, {profile?.display_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm text-[#A4AAA5] mt-1.5 max-w-2xl leading-relaxed">
              Hier ist dein persönlicher Überblick über deine Fächer, Noten, anstehenden Klausuren und Lernaufgaben.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('timer')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] rounded-xl transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-[#C5F82A]" />
              Fokus starten
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-xl transition-all cursor-pointer shadow-lg shadow-[#C5F82A]/20"
            >
              <Plus className="w-4 h-4" />
              Schnitt berechnen
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#292F2B] relative z-10">
          <div className="p-4 bg-[#171B18] rounded-xl border border-[#292F2B] hover:border-[#38413b] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A4AAA5] mb-1.5">
              <Award className="w-4 h-4 text-[#C5F82A]" />
              <span>Aktiver Schnitt</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {latestGrade ? latestGrade.average.toFixed(2).replace('.', ',') : '—'}
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-1 truncate">
              {latestGrade ? latestGrade.title : 'Noch kein Schnitt gespeichert'}
            </div>
          </div>

          <div className="p-4 bg-[#171B18] rounded-xl border border-[#292F2B] hover:border-[#38413b] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A4AAA5] mb-1.5">
              <Layers className="w-4 h-4 text-[#C5F82A]" />
              <span>Fächer</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {subjects.length}
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-1">
              Angelegte Studienfächer
            </div>
          </div>

          <div className="p-4 bg-[#171B18] rounded-xl border border-[#292F2B] hover:border-[#38413b] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A4AAA5] mb-1.5">
              <Calendar className="w-4 h-4 text-[#C5F82A]" />
              <span>Nächste Klausuren</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {exams.length}
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-1">
              Im Lernplan terminiert
            </div>
          </div>

          <div className="p-4 bg-[#171B18] rounded-xl border border-[#292F2B] hover:border-[#38413b] transition-all">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A4AAA5] mb-1.5">
              <CheckSquare className="w-4 h-4 text-[#C5F82A]" />
              <span>Offene Aufgaben</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {pendingTasks.length}
            </div>
            <div className="text-[11px] text-[#A4AAA5] mt-1">
              Zu erledigen
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Recent Notes & Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recent Notes */}
        <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#292F2B]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C5F82A]" />
                <h3 className="font-bold text-white text-sm">Aktuelle Notizen</h3>
              </div>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs font-mono text-[#C5F82A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Alle anzeigen ({notes.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#A4AAA5]">Notizen laden...</div>
            ) : notes.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="w-8 h-8 text-[#292F2B] mx-auto mb-2" />
                <p className="text-xs text-[#A4AAA5]">Du hast noch keine Notizen angelegt.</p>
                <button
                  onClick={() => setActiveTab('notes')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Erste Notiz schreiben
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#292F2B] mt-2">
                {notes.slice(0, 4).map((note) => {
                  const subject = subjects.find((s) => s.id === note.subject_id);
                  return (
                    <div
                      key={note.id}
                      onClick={() => {
                        setActiveTab('notes');
                        if (onOpenNote) onOpenNote(note.id);
                      }}
                      className="py-3 hover:bg-[#171B18] -mx-2 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {note.is_pinned && <span className="text-[#C5F82A] mr-1.5">📌</span>}
                          {note.title}
                        </span>
                        {subject && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 border border-[#292F2B]"
                            style={{ backgroundColor: `${subject.color}25`, color: '#FFFFFF' }}
                          >
                            {subject.name}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A4AAA5] line-clamp-1 mt-0.5">
                        {note.content || 'Kein Textinhalt'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#292F2B] mt-4">
            <button
              onClick={() => setActiveTab('notes')}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] rounded-xl transition-colors cursor-pointer"
            >
              + Neue Notiz erstellen
            </button>
          </div>
        </div>

        {/* Right: Upcoming Exams & Tasks */}
        <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#292F2B]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C5F82A]" />
                <h3 className="font-bold text-white text-sm">Nächste Prüfungen & Aufgaben</h3>
              </div>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs font-mono text-[#C5F82A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                Lernplan öffnen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-[#A4AAA5]">Prüfungen laden...</div>
            ) : exams.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-[#292F2B] mx-auto mb-2" />
                <p className="text-xs text-[#A4AAA5]">Keine anstehenden Klausuren eingetragen.</p>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#090B0A] bg-[#C5F82A] hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Klausurtermin anlegen
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#292F2B] mt-2">
                {exams.slice(0, 3).map((exam) => {
                  const subject = subjects.find((s) => s.id === exam.subject_id);
                  const countdown = getDaysUntil(exam.exam_date);
                  const isSoon = countdown.includes('Heute') || countdown.includes('Morgen') || countdown.includes('In 2 Tagen') || countdown.includes('In 3 Tagen');

                  return (
                    <div key={exam.id} className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-white truncate">
                          {exam.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                            isSoon ? 'bg-[#C5F82A]/10 text-[#C5F82A] border-[#C5F82A]/30' : 'bg-[#171B18] text-[#A4AAA5] border-[#292F2B]'
                          }`}
                        >
                          {countdown}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#A4AAA5] mt-1">
                        <span>Datum: {new Date(exam.exam_date).toLocaleDateString('de-DE')}</span>
                        {subject && (
                          <>
                            <span>·</span>
                            <span style={{ color: '#C5F82A' }} className="font-medium">
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

          <div className="pt-4 border-t border-[#292F2B] mt-4">
            <button
              onClick={() => setActiveTab('planner')}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] rounded-xl transition-colors cursor-pointer"
            >
              + Klausur oder Lernaufgabe eintragen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExams, createExam, deleteExam, getStudyTasks, createStudyTask, toggleStudyTask, deleteStudyTask, getSubjects } from '../lib/studentData';
import { Exam, StudyTask, Subject } from '../lib/supabase';
import { Calendar, CheckSquare, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';

export const PlannerView: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // New exam form state
  const [showExamForm, setShowExamForm] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examSubjectId, setExamSubjectId] = useState<string>('');
  const [examWeight, setExamWeight] = useState('1');
  const [examDesc, setExamDesc] = useState('');

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskExamId, setTaskExamId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedExams, fetchedTasks, fetchedSubs] = await Promise.all([
        getExams(user.id),
        getStudyTasks(user.id),
        getSubjects(user.id),
      ]);
      setExams(fetchedExams);
      setTasks(fetchedTasks);
      setSubjects(fetchedSubs);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!user) return;
    if (!examTitle.trim() || !examDate) {
      setErrorMsg('Bitte Titel und Prüfungsdatum eingeben.');
      return;
    }

    try {
      const weightNum = parseFloat(examWeight.replace(',', '.')) || 1.0;
      const created = await createExam(
        user.id,
        examTitle.trim(),
        examDate,
        examSubjectId || null,
        weightNum,
        examDesc.trim()
      );
      setExams([...exams, created].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()));
      setShowExamForm(false);
      setExamTitle('');
      setExamDate('');
      setExamDesc('');
    } catch {
      setErrorMsg('Fehler beim Anlegen der Klausur.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!user) return;
    await deleteExam(user.id, id);
    setExams(exams.filter((e) => e.id !== id));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskTitle.trim()) return;

    try {
      const created = await createStudyTask(
        user.id,
        taskTitle.trim(),
        taskExamId || null,
        taskDueDate || null
      );
      setTasks([created, ...tasks]);
      setTaskTitle('');
      setTaskDueDate('');
    } catch {
      //
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user) return;
    const nextStatus = !currentStatus;
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, is_completed: nextStatus } : t)));
    await toggleStudyTask(user.id, taskId, nextStatus);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    setTasks(tasks.filter((t) => t.id !== taskId));
    await deleteStudyTask(user.id, taskId);
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Vergangen', isOverdue: true };
    if (diff === 0) return { label: 'Heute fällig!', isSoon: true };
    if (diff === 1) return { label: 'Morgen', isSoon: true };
    return { label: `In ${diff} Tagen`, isSoon: diff <= 3 };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900">Lernplan & Prüfungskalender</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plane anstehende Klausuren, behalte Fristen im Blick und hake deine Vorbereitungsaufgaben ab.
          </p>
        </div>

        <button
          onClick={() => setShowExamForm(!showExamForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          {showExamForm ? 'Formular schließen' : 'Klausur eintragen'}
        </button>
      </div>

      {/* New Exam Dialog */}
      {showExamForm && (
        <form onSubmit={handleCreateExam} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Neue Klausur / Prüfung eintragen</h3>
          {errorMsg && (
            <div className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titel der Prüfung *
              </label>
              <input
                type="text"
                required
                placeholder="z. B. Mathematik Klausur 2"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Datum *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fach zuordnen
              </label>
              <select
                value={examSubjectId}
                onChange={(e) => setExamSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">(Kein Fach ausgewählt)</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gewichtung für den Gesamtschnitt
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={examWeight}
                onChange={(e) => setExamWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Themenschwerpunkte / Notizen (optional)
            </label>
            <input
              type="text"
              placeholder="z. B. Kapitel 4 & 5, Formelblatt mitbringen"
              value={examDesc}
              onChange={(e) => setExamDesc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowExamForm(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-xs"
            >
              Klausur speichern
            </button>
          </div>
        </form>
      )}

      {/* Main 2-Column Split: Exams List & Study Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Upcoming Exams */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Anstehende Klausuren</span>
            </h3>
            <span className="text-xs text-slate-400">{exams.length} Termine</span>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Lade Termine...</div>
            ) : exams.length === 0 ? (
              <div className="py-10 text-center">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Keine Prüfungen eingetragen.</p>
                <button
                  onClick={() => setShowExamForm(true)}
                  className="mt-3 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-light hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Erste Klausur eintragen
                </button>
              </div>
            ) : (
              exams.map((exam) => {
                const subject = subjects.find((s) => s.id === exam.subject_id);
                const daysInfo = getDaysUntil(exam.exam_date);

                return (
                  <div
                    key={exam.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{exam.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <span>{new Date(exam.exam_date).toLocaleDateString('de-DE')}</span>
                          {subject && (
                            <>
                              <span>·</span>
                              <span style={{ color: subject.color }} className="font-semibold">
                                {subject.name}
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span>Gewichtung: {exam.weight}x</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            daysInfo.isOverdue
                              ? 'bg-slate-200 text-slate-600'
                              : daysInfo.isSoon
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-50 text-primary'
                          }`}
                        >
                          {daysInfo.label}
                        </span>

                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          title="Löschen"
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {exam.description && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                        {exam.description}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Study Tasks Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-700" />
              <span>Lernaufgaben & To-Do Liste</span>
            </h3>
            <span className="text-xs text-slate-400">
              {tasks.filter((t) => !t.is_completed).length} offen
            </span>
          </div>

          {/* Quick add task input */}
          <form onSubmit={handleCreateTask} className="my-4 flex items-center gap-2">
            <input
              type="text"
              required
              placeholder="Neue Lernaufgabe hinzufügen..."
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tasks list */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Lade Aufgaben...</div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Keine Aufgaben vorhanden. Trage oben deine nächste Lerneinheit ein!
              </div>
            ) : (
              tasks.map((task) => {
                const daysInfo = task.due_date ? getDaysUntil(task.due_date) : null;
                const isOverdue = daysInfo?.isOverdue && !task.is_completed;

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      task.is_completed
                        ? 'bg-slate-50/50 border-slate-200 opacity-60'
                        : isOverdue
                        ? 'bg-red-50/40 border-red-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleTask(task.id, task.is_completed)}
                        className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0"
                      />
                      <span
                        className={`text-xs text-slate-900 ${
                          task.is_completed ? 'line-through text-slate-400' : 'font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {daysInfo && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            task.is_completed
                              ? 'text-slate-400 bg-slate-100'
                              : isOverdue
                              ? 'text-red-700 bg-red-100 font-bold'
                              : 'text-slate-500 bg-slate-100'
                          }`}
                        >
                          {daysInfo.label}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

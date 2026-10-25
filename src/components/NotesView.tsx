import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, createNote, updateNote, deleteNote, getSubjects } from '../lib/studentData';
import { StudentNote, Subject } from '../lib/supabase';
import { Search, Plus, Trash2, Pin, PinOff, BookOpen, Check, AlertCircle, ArrowLeft, Filter } from 'lucide-react';

interface NotesViewProps {
  initialSelectedNoteId?: string | null;
}

export const NotesView: React.FC<NotesViewProps> = ({ initialSelectedNoteId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title'>('updated');
  const [selectedNote, setSelectedNote] = useState<StudentNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editSubjectId, setEditSubjectId] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // Load data
  const loadNotesAndSubjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedNotes, fetchedSubjects] = await Promise.all([
        getNotes(user.id),
        getSubjects(user.id),
      ]);
      setNotes(fetchedNotes);
      setSubjects(fetchedSubjects);

      if (initialSelectedNoteId) {
        const found = fetchedNotes.find((n) => n.id === initialSelectedNoteId);
        if (found) {
          selectNote(found);
        } else if (fetchedNotes.length > 0) {
          selectNote(fetchedNotes[0]);
        }
      } else if (fetchedNotes.length > 0 && !selectedNote) {
        selectNote(fetchedNotes[0]);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotesAndSubjects();
  }, [user]);

  const selectNote = (note: StudentNote) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditSubjectId(note.subject_id);
    setIsPinned(note.is_pinned);
    setSaveStatus(null);
    setShowMobileEditor(true);
  };

  const handleCreateNewNote = async () => {
    if (!user) return;
    const defaultSubject = subjects.length > 0 ? subjects[0].id : null;
    const newNote = await createNote(
      user.id,
      'Neue Notiz',
      '',
      defaultSubject,
      false
    );
    setNotes([newNote, ...notes]);
    selectNote(newNote);
  };

  // Debounced auto-save handler
  useEffect(() => {
    if (!selectedNote || !user) return;
    if (
      editTitle === selectedNote.title &&
      editContent === selectedNote.content &&
      editSubjectId === selectedNote.subject_id &&
      isPinned === selectedNote.is_pinned
    ) {
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        const updated = await updateNote(user.id, selectedNote.id, {
          title: editTitle.trim() || 'Unbenannte Notiz',
          content: editContent,
          subject_id: editSubjectId,
          is_pinned: isPinned,
        });
        setSelectedNote(updated);
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        setSaveStatus(null);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [editTitle, editContent, editSubjectId, isPinned]);

  const handleDeleteCurrentNote = async () => {
    if (!user || !selectedNote) return;
    await deleteNote(user.id, selectedNote.id);
    const remaining = notes.filter((n) => n.id !== selectedNote.id);
    setNotes(remaining);
    setShowDeleteConfirm(false);
    if (remaining.length > 0) {
      selectNote(remaining[0]);
    } else {
      setSelectedNote(null);
      setShowMobileEditor(false);
    }
  };

  // Filter & sort
  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubjectId === 'all' || n.subject_id === selectedSubjectId;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'de');
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden min-h-[620px] flex flex-col">
      {/* Top action header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="font-extrabold text-slate-900 text-lg">Meine Studiennotizen</h2>
          <span className="text-xs bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-bold">
            {notes.length}
          </span>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Neue Notiz
        </button>
      </div>

      {/* Main 2-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* Left Panel: Search, Subject Filter & Note Cards List */}
        <div className={`p-4 flex flex-col gap-3 ${showMobileEditor ? 'hidden md:flex' : 'flex'}`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Notizen durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>

          {/* Subject Filter & Sort controls */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex-1 relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Alle Fächer ({notes.length})</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'title')}
              className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="updated">Zuletzt bearbeitet</option>
              <option value="title">Alphabetisch (Titel)</option>
            </select>
          </div>

          {/* Note List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Lade Notizen...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="py-8 text-center px-4">
                <p className="text-xs text-slate-500 font-medium">Keine passenden Notizen gefunden.</p>
                {notes.length === 0 && (
                  <button
                    onClick={handleCreateNewNote}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1 text-xs text-primary bg-primary-light rounded-md font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Notiz schreiben
                  </button>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                const subject = subjects.find((s) => s.id === note.subject_id);

                return (
                  <div
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/70 border-primary shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                        {note.is_pinned && <span className="text-amber-500 text-xs">📌</span>}
                        {note.title}
                      </span>
                      {subject && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {note.content || 'Leere Notiz...'}
                    </p>
                    <div className="text-[9px] text-slate-400 mt-2">
                      Aktualisiert: {new Date(note.updated_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Editor Area */}
        <div className={`p-5 flex flex-col justify-between ${showMobileEditor ? 'flex' : 'hidden md:flex'}`}>
          {selectedNote ? (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Mobile Back button & top editor toolbar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <button
                  onClick={() => setShowMobileEditor(false)}
                  className="md:hidden inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Zurück zur Liste
                </button>

                <div className="flex items-center gap-2 ml-auto">
                  {saveStatus === 'saving' && (
                    <span className="text-[11px] text-slate-400 animate-pulse">Wird gespeichert...</span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Gespeichert
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    title={isPinned ? 'Oben anheften aufheben' : 'Notiz oben anheften'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isPinned
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'border-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Notiz löschen"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subject Tag Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Fach zuordnen
                </label>
                <select
                  value={editSubjectId || ''}
                  onChange={(e) => setEditSubjectId(e.target.value || null)}
                  className="text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary max-w-xs"
                >
                  <option value="">(Kein Fach zugeordnet)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title Input */}
              <input
                type="text"
                placeholder="Titel der Notiz..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-lg sm:text-xl font-extrabold text-slate-900 border-b border-transparent hover:border-slate-200 focus:border-primary focus:outline-none py-1"
              />

              {/* Content Textarea */}
              <div className="flex-1 flex flex-col">
                <textarea
                  placeholder="Schreibe deine Zusammenfassung, Formeln, Vokabeln oder Gedanken hier auf..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full flex-1 min-h-[300px] p-3 text-xs sm:text-sm font-sans text-slate-800 bg-slate-50/40 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white resize-y"
                />
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-700 text-sm">Keine Notiz ausgewählt</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Wähle eine Notiz aus der Liste links aus oder erstelle eine neue Studiennotiz.
              </p>
              <button
                onClick={handleCreateNewNote}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Neue Notiz anlegen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-2">Notiz unwiderruflich löschen?</h4>
            <p className="text-xs text-slate-600 mb-4">
              Möchtest du die Notiz <strong>"{selectedNote?.title}"</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteCurrentNote}
                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

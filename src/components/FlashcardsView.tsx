import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Play,
  RotateCw,
  CheckCircle2,
  XCircle,
  Trash2,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Award,
  HelpCircle,
} from 'lucide-react';
import {
  FlashcardDeck,
  Flashcard,
  Subject,
  getDecks,
  createDeck,
  deleteDeck,
  getCards,
  createCard,
  updateCardStatus,
  deleteCard,
  getSubjects,
} from '../lib/studentData';
import { useAuth } from '../context/AuthContext';

interface FlashcardsViewProps {
  onRequireAuth: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onRequireAuth }) => {
  const { user } = useAuth();

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  // Study Mode State
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ mastered: number; learning: number }>({ mastered: 0, learning: 0 });
  const [sessionFinished, setSessionFinished] = useState(false);

  // Deck Modal
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckSubjectId, setNewDeckSubjectId] = useState<string>('');

  // Card Modal
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardQuestion, setNewCardQuestion] = useState('');
  const [newCardAnswer, setNewCardAnswer] = useState('');

  const loadInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedDecks, fetchedSubjects] = await Promise.all([
        getDecks(user.id),
        getSubjects(user.id),
      ]);
      setDecks(fetchedDecks);
      setSubjects(fetchedSubjects);
    } catch (err) {
      console.error('Fehler beim Laden der Karteikarten:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [user, loadInitialData]);

  const loadDeckCards = async (deck: FlashcardDeck) => {
    if (!user) return;
    setActiveDeck(deck);
    setIsStudying(false);
    setSessionFinished(false);
    try {
      const fetchedCards = await getCards(user.id, deck.id);
      setCards(fetchedCards);
    } catch (err) {
      console.error('Fehler beim Laden der Karten:', err);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!newDeckTitle.trim()) return;

    try {
      const created = await createDeck(
        user.id,
        newDeckTitle.trim(),
        newDeckDescription.trim(),
        newDeckSubjectId || null
      );
      setDecks([created, ...decks]);
      setShowDeckModal(false);
      setNewDeckTitle('');
      setNewDeckDescription('');
      setNewDeckSubjectId('');
      loadDeckCards(created);
    } catch (err) {
      console.error('Fehler beim Erstellen des Decks:', err);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!user) return;
    if (!window.confirm('Möchtest du dieses Kartendeck wirklich löschen?')) return;
    try {
      await deleteDeck(user.id, deckId);
      setDecks(decks.filter((d) => d.id !== deckId));
      if (activeDeck?.id === deckId) {
        setActiveDeck(null);
        setCards([]);
        setIsStudying(false);
      }
    } catch (err) {
      console.error('Fehler beim Löschen des Decks:', err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeDeck) return;
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) return;

    try {
      const created = await createCard(
        user.id,
        activeDeck.id,
        newCardQuestion.trim(),
        newCardAnswer.trim()
      );
      setCards([...cards, created]);
      setShowCardModal(false);
      setNewCardQuestion('');
      setNewCardAnswer('');
    } catch (err) {
      console.error('Fehler beim Erstellen der Karte:', err);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user || !activeDeck) return;
    try {
      await deleteCard(user.id, cardId, activeDeck.id);
      setCards(cards.filter((c) => c.id !== cardId));
    } catch (err) {
      console.error('Fehler beim Löschen der Karte:', err);
    }
  };

  // Study Flow
  const startStudySession = () => {
    if (cards.length === 0) return;
    setIsStudying(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionResults({ mastered: 0, learning: 0 });
    setSessionFinished(false);
  };

  const handleRateCard = async (status: 'learning' | 'mastered') => {
    if (!user || !activeDeck || cards.length === 0) return;
    const currentCard = cards[currentCardIndex];

    try {
      await updateCardStatus(user.id, currentCard.id, status, activeDeck.id);
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, status } : c))
      );
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Kartenstatus:', err);
    }

    setSessionResults((prev) => ({
      ...prev,
      [status]: prev[status] + 1,
    }));

    if (currentCardIndex + 1 < cards.length) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setSessionFinished(true);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Digitale Karteikarten & Spaced Repetition
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 text-sm sm:text-base">
          Erstelle eigene Vokabel- und Definitionen-Decks mit interaktivem Flip-Modus und tracke deinen Lernfortschritt direkt in der Cloud.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-colors"
        >
          Kostenlos anmelden & Decks nutzen
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Karteikarten & Lernbox
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Trainiere Definitionen, Vokabeln und Formeln mit interaktivem Flip-Lernmodus.
          </p>
        </div>
        <button
          onClick={() => setShowDeckModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neues Deck anlegen
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Decks Sidebar / List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Deine Decks ({decks.length})
            </span>
          </div>

          {decks.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Noch kein Kartendeck vorhanden.
              </p>
              <button
                onClick={() => setShowDeckModal(true)}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Erstes Deck erstellen
              </button>
            </div>
          ) : (
            decks.map((deck) => {
              const subject = subjects.find((s) => s.id === deck.subject_id);
              const isSelected = activeDeck?.id === deck.id;
              return (
                <div
                  key={deck.id}
                  onClick={() => loadDeckCards(deck)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      loadDeckCards(deck);
                    }
                  }}
                  className={`cursor-pointer text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {subject && (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color || '#6366f1' }}
                            title={subject.name}
                          />
                        )}
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                          {deck.title}
                        </h3>
                      </div>
                      {deck.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
                      title="Deck löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Deck Detail / Study Arena */}
        <div className="lg:col-span-8">
          {activeDeck ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm">
              {/* Deck header actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {activeDeck.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cards.length} {cards.length === 1 ? 'Karte' : 'Karten'} in diesem Deck
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Karte hinzufügen
                  </button>
                  {cards.length > 0 && !isStudying && (
                    <button
                      onClick={startStudySession}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Lernmodus starten
                    </button>
                  )}
                </div>
              </div>

              {/* Study Mode */}
              {isStudying ? (
                <div>
                  {sessionFinished ? (
                    <div className="py-8 text-center max-w-md mx-auto">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        Starke Leistung! Lernsession beendet
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                        Du hast alle {cards.length} Karten in diesem Deck durchgearbeitet.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {sessionResults.mastered}
                          </div>
                          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Sicher gewusst
                          </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40">
                          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {sessionResults.learning}
                          </div>
                          <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Noch üben
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={startStudySession}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          Deck erneut üben
                        </button>
                        <button
                          onClick={() => setIsStudying(false)}
                          className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium rounded-xl transition-colors"
                        >
                          Kartenübersicht
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between mb-4 text-xs font-medium text-slate-500">
                        <button
                          onClick={() => setIsStudying(false)}
                          className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Lernmodus beenden
                        </button>
                        <span>
                          Karte {currentCardIndex + 1} von {cards.length}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-6">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{
                            width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Interactive Flip Card */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                            e.preventDefault();
                            setIsFlipped(!isFlipped);
                          }
                        }}
                        className={`min-h-[260px] p-8 rounded-2xl border-2 cursor-pointer select-none transition-all duration-300 flex flex-col justify-between items-center text-center relative ${
                          isFlipped
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {isFlipped ? 'Rückseite: Antwort' : 'Vorderseite: Frage'}
                        </span>

                        <div className="my-auto py-4">
                          <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-white leading-relaxed max-w-lg">
                            {isFlipped
                              ? cards[currentCardIndex].answer
                              : cards[currentCardIndex].question}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <RotateCw className="w-3.5 h-3.5 animate-pulse" />
                          <span>Klicken oder Leertaste drücken zum Umdrehen</span>
                        </div>
                      </div>

                      {/* Rate buttons */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                          onClick={() => handleRateCard('learning')}
                          className="flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Noch üben
                        </button>
                        <button
                          onClick={() => handleRateCard('mastered')}
                          className="flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Gewusst!
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Card List Mode */
                <div>
                  {cards.length === 0 ? (
                    <div className="py-12 text-center">
                      <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Dieses Deck ist noch leer
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                        Füge deine ersten Karteikarten mit Frage und Antwort hinzu, um das Lernen zu starten.
                      </p>
                      <button
                        onClick={() => setShowCardModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Erste Karte hinzufügen
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cards.map((card, idx) => (
                        <div
                          key={card.id}
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-400">
                                #{idx + 1}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  card.status === 'mastered'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                {card.status === 'mastered' ? 'Gewusst' : 'Im Lernprozess'}
                              </span>
                            </div>
                            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                              {card.question}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {card.answer}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-slate-400 hover:text-rose-500 self-end sm:self-center p-1.5 rounded transition-colors"
                            title="Karte löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base mb-1">
                Wähle ein Kartendeck aus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Klicke links auf ein vorhandenes Deck oder erstelle ein neues, um Vokabeln oder Definitionen abzufragen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Deck */}
      {showDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Neues Kartendeck erstellen
            </h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Deck-Titel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Englisch Vokabeln Unit 3, Biologie Zellaufbau"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  placeholder="z.B. Vorbereitung auf die Klausur am Donnerstag"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Zugehöriges Schulfach
                </label>
                <select
                  value={newDeckSubjectId}
                  onChange={(e) => setNewDeckSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Kein Fach zugeordnet</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeckModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Deck anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Card */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Neue Karteikarte für &quot;{activeDeck?.title}&quot;
            </h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Vorderseite (Frage / Begriff) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="z.B. Was versteht man unter Fotosynthese?"
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Rückseite (Antwort / Erklärung) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="z.B. Erzeugung von energiereichen Stoffen aus energieärmeren Stoffen mithilfe von Lichtenergie."
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  Karte speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
  Award,
  HelpCircle,
  AlertCircle,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    if (!user || !newDeckTitle.trim()) return;

    try {
      const created = await createDeck(
        user.id,
        newDeckTitle.trim(),
        newDeckDescription.trim() || '',
        newDeckSubjectId || null
      );
      setDecks([...decks, created]);
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
    if (!user || !activeDeck || !newCardQuestion.trim() || !newCardAnswer.trim()) return;

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

  const startStudySession = () => {
    if (cards.length === 0) return;
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionResults({ mastered: 0, learning: 0 });
    setSessionFinished(false);
    setIsStudying(true);
  };

  const handleRateCard = async (status: 'mastered' | 'learning') => {
    if (!user || !cards[currentCardIndex] || !activeDeck) return;
    setErrorMsg(null);

    const currentCard = cards[currentCardIndex];
    try {
      await updateCardStatus(user.id, currentCard.id, status, activeDeck.id);
      setCards((prev) =>
        prev.map((c) => (c.id === currentCard.id ? { ...c, status } : c))
      );
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
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Status:', err);
      setErrorMsg('Status der Karteikarte konnte nicht gespeichert werden.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-white">
        <div className="w-16 h-16 bg-[#171B18] border border-[#292F2B] text-[#C5F82A] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-white mb-3">
          Digitale Karteikarten & Spaced Repetition
        </h2>
        <p className="text-[#A4AAA5] max-w-md mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          Erstelle eigene Vokabel- und Definitionen-Decks mit interaktivem Flip-Modus und tracke deinen Lernfortschritt direkt in der Cloud.
        </p>
        <button
          onClick={onRequireAuth}
          className="px-6 py-3.5 bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold rounded-xl shadow-xl shadow-[#C5F82A]/20 transition-all cursor-pointer"
        >
          Kostenlos anmelden & Decks nutzen
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#A4AAA5]">
        <div className="w-8 h-8 border-2 border-[#C5F82A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* View Header */}
      <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#C5F82A]" />
            Karteikarten & Lernbox
          </h1>
          <p className="text-xs text-[#A4AAA5] mt-1">
            Trainiere Definitionen, Vokabeln und Formeln mit interaktivem Flip-Lernmodus.
          </p>
        </div>
        <button
          onClick={() => setShowDeckModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold rounded-xl text-xs shadow-md shadow-[#C5F82A]/20 transition-all cursor-pointer shrink-0"
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
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#A4AAA5]">
              Deine Decks ({decks.length})
            </span>
          </div>

          {decks.length === 0 ? (
            <div className="bg-[#111412] p-8 rounded-2xl border border-[#292F2B] text-center">
              <Layers className="w-8 h-8 text-[#292F2B] mx-auto mb-3" />
              <p className="text-sm text-[#A4AAA5] mb-4">
                Noch kein Kartendeck vorhanden.
              </p>
              <button
                onClick={() => setShowDeckModal(true)}
                className="text-xs font-bold text-[#C5F82A] hover:underline cursor-pointer"
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
                      ? 'bg-[#171B18] border-[#C5F82A] shadow-md'
                      : 'bg-[#111412] border-[#292F2B] hover:border-[#38413b]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {subject && (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: subject.color || '#C5F82A' }}
                            title={subject.name}
                          />
                        )}
                        <h3 className="font-bold text-white text-sm truncate">
                          {deck.title}
                        </h3>
                      </div>
                      {deck.description && (
                        <p className="text-xs text-[#A4AAA5] line-clamp-1">
                          {deck.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="text-[#717772] hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
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
            <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-5 sm:p-6 shadow-xl">
              {/* Deck header actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#292F2B] gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">
                    {activeDeck.title}
                  </h2>
                  <p className="text-xs font-mono text-[#A4AAA5]">
                    {cards.length} {cards.length === 1 ? 'Karte' : 'Karten'} in diesem Deck
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCardModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Karte hinzufügen
                  </button>
                  {cards.length > 0 && !isStudying && (
                    <button
                      onClick={startStudySession}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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
                      <div className="w-16 h-16 bg-[#171B18] border border-[#292F2B] text-[#C5F82A] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Starke Leistung! Lernsession beendet
                      </h3>
                      <p className="text-sm text-[#A4AAA5] mb-6">
                        Du hast alle {cards.length} Karten in diesem Deck durchgearbeitet.
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#171B18] p-4 rounded-xl border border-[#292F2B]">
                          <div className="text-2xl font-black text-[#C5F82A]">
                            {sessionResults.mastered}
                          </div>
                          <div className="text-xs font-mono text-[#A4AAA5]">
                            Sicher gewusst
                          </div>
                        </div>
                        <div className="bg-[#171B18] p-4 rounded-xl border border-[#292F2B]">
                          <div className="text-2xl font-black text-amber-400">
                            {sessionResults.learning}
                          </div>
                          <div className="text-xs font-mono text-[#A4AAA5]">
                            Noch üben
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={startStudySession}
                          className="px-4 py-2.5 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Deck erneut üben
                        </button>
                        <button
                          onClick={() => setIsStudying(false)}
                          className="px-4 py-2.5 border border-[#292F2B] text-white hover:bg-[#171B18] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                        >
                          Kartenübersicht
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between mb-4 text-xs font-mono text-[#A4AAA5]">
                        <button
                          onClick={() => setIsStudying(false)}
                          className="flex items-center gap-1 hover:text-white cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Lernmodus beenden
                        </button>
                        <span>
                          Karte {currentCardIndex + 1} von {cards.length}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#171B18] h-2 rounded-full overflow-hidden mb-6 border border-[#292F2B]">
                        <div
                          className="bg-[#C5F82A] h-full transition-all duration-300"
                          style={{
                            width: `${((currentCardIndex + 1) / cards.length) * 100}%`,
                          }}
                        />
                      </div>

                      {errorMsg && (
                        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

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
                            ? 'bg-[#171B18] border-[#C5F82A]'
                            : 'bg-[#111412] border-[#292F2B] hover:border-[#38413b] shadow-xl'
                        }`}
                      >
                        <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#171B18] text-[#C5F82A] border border-[#292F2B]">
                          {isFlipped ? 'Rückseite: Antwort' : 'Vorderseite: Frage'}
                        </span>

                        <div className="my-auto py-4">
                          <p className="text-lg sm:text-xl font-bold text-white leading-relaxed max-w-lg">
                            {isFlipped
                              ? cards[currentCardIndex].answer
                              : cards[currentCardIndex].question}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-[#A4AAA5]">
                          <RotateCw className="w-3.5 h-3.5 animate-pulse text-[#C5F82A]" />
                          <span>Klicken oder Leertaste drücken zum Umdrehen</span>
                        </div>
                      </div>

                      {/* Rate buttons */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                          onClick={() => handleRateCard('learning')}
                          className="flex items-center justify-center gap-2 py-3 bg-[#171B18] hover:bg-[#202521] border border-[#292F2B] text-amber-400 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Noch üben
                        </button>
                        <button
                          onClick={() => handleRateCard('mastered')}
                          className="flex items-center justify-center gap-2 py-3 bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-md shadow-[#C5F82A]/20"
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
                      <HelpCircle className="w-10 h-10 text-[#292F2B] mx-auto mb-3" />
                      <p className="text-sm font-bold text-white mb-1">
                        Dieses Deck ist noch leer
                      </p>
                      <p className="text-xs text-[#A4AAA5] max-w-sm mx-auto mb-4">
                        Füge deine ersten Karteikarten mit Frage und Antwort hinzu, um das Lernen zu starten.
                      </p>
                      <button
                        onClick={() => setShowCardModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
                          className="p-4 rounded-xl border border-[#292F2B] bg-[#171B18] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-bold text-[#717772]">
                                #{idx + 1}
                              </span>
                              <span
                                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                                  card.status === 'mastered'
                                    ? 'bg-[#C5F82A]/10 text-[#C5F82A] border-[#C5F82A]/30'
                                    : 'bg-[#111412] text-amber-400 border-amber-400/30'
                                }`}
                              >
                                {card.status === 'mastered' ? 'Gewusst' : 'Im Lernprozess'}
                              </span>
                            </div>
                            <div className="font-bold text-white text-sm mb-1">
                              {card.question}
                            </div>
                            <div className="text-xs text-[#A4AAA5]">
                              {card.answer}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-[#717772] hover:text-red-400 self-end sm:self-center p-1.5 rounded transition-colors cursor-pointer"
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
            <div className="bg-[#111412] rounded-2xl border border-[#292F2B] p-12 text-center text-[#A4AAA5]">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-[#292F2B]" />
              <h3 className="font-bold text-white text-base mb-1">
                Wähle ein Kartendeck aus
              </h3>
              <p className="text-xs text-[#A4AAA5] max-w-sm mx-auto">
                Klicke links auf ein vorhandenes Deck oder erstelle ein neues, um Vokabeln oder Definitionen abzufragen.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Deck */}
      {showDeckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#171B18] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292F2B]">
            <h3 className="text-lg font-bold text-white mb-4">
              Neues Kartendeck erstellen
            </h3>
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] mb-1">
                  Deck-Titel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Englisch Vokabeln Unit 3, Biologie Zellaufbau"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#292F2B] bg-[#090B0A] text-white text-sm focus:outline-none focus:border-[#C5F82A] placeholder-[#717772]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] mb-1">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  placeholder="z.B. Vorbereitung auf die Klausur am Donnerstag"
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#292F2B] bg-[#090B0A] text-white text-sm focus:outline-none focus:border-[#C5F82A] placeholder-[#717772]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] mb-1">
                  Zugehöriges Schulfach
                </label>
                <select
                  value={newDeckSubjectId}
                  onChange={(e) => setNewDeckSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#292F2B] bg-[#090B0A] text-white text-sm focus:outline-none focus:border-[#C5F82A]"
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
                  className="px-4 py-2 text-xs font-semibold text-[#A4AAA5] hover:text-white rounded-xl border border-[#292F2B] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#171B18] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#292F2B]">
            <h3 className="text-lg font-bold text-white mb-4">
              Neue Karteikarte für &quot;{activeDeck?.title}&quot;
            </h3>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] mb-1">
                  Vorderseite (Frage / Begriff) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="z.B. Was versteht man unter Fotosynthese?"
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#292F2B] bg-[#090B0A] text-white text-sm focus:outline-none focus:border-[#C5F82A] placeholder-[#717772]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#A4AAA5] mb-1">
                  Rückseite (Antwort / Erklärung) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="z.B. Erzeugung von energiereichen Stoffen aus energieärmeren Stoffen mithilfe von Lichtenergie."
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#292F2B] bg-[#090B0A] text-white text-sm focus:outline-none focus:border-[#C5F82A] placeholder-[#717772]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#A4AAA5] hover:text-white rounded-xl border border-[#292F2B] cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5F82A] hover:bg-white text-[#090B0A] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
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

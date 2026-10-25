import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { GradeCalculator } from './components/GradeCalculator';
import { DashboardView } from './components/DashboardView';
import { NotesView } from './components/NotesView';
import { SubjectsView } from './components/SubjectsView';
import { PlannerView } from './components/PlannerView';
import { FlashcardsView } from './components/FlashcardsView';
import { FocusTimerView } from './components/FocusTimerView';
import { Footer } from './components/Footer';
import {
  HelpCircle,
  BookOpen,
  Info,
  ChevronDown,
} from 'lucide-react';

const PROTECTED_TABS: ActiveTab[] = ['dashboard', 'notes', 'subjects', 'planner', 'flashcards'];

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigateTab = (tab: ActiveTab) => {
    if (PROTECTED_TABS.includes(tab) && authLoading) return;
    if (PROTECTED_TABS.includes(tab) && !user) {
      openAuth('login');
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!authLoading && !user && PROTECTED_TABS.includes(activeTab)) {
      setActiveTab('calculator');
    }
  }, [activeTab, authLoading, user]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        openAuthModal={() => openAuth('login')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'calculator' && (
          <div>
            {/* The Grade Calculator */}
            <div className="py-6 sm:py-10">
              <GradeCalculator
                openAuthModal={() => openAuth('login')}
                onSavedGradeSuccess={() => {
                  // Grade saved to account
                }}
              />
            </div>

            {/* Preserved Educational Content & German School System Guides */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 pb-16">
              {/* AdSense-ready compliant advertisement banner placeholder */}
              <div
                id="werbung-placeholder"
                className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 p-6 text-center text-xs text-slate-400 dark:text-slate-500"
                aria-label="Werbebereich"
              >
                <div className="font-semibold uppercase tracking-wider text-[11px] text-slate-400 dark:text-slate-500 mb-1">
                  Anzeige / Werbeplatz
                </div>
                <p className="max-w-md mx-auto text-[11px]">
                  Dieser Platzhalter ist für Google AdSense reserviert. Transparente, nicht-irreführende Werbeeinblendungen zur Finanzierung des kostenlosen Schülerangebots.
                </p>
              </div>

              {/* How it works section */}
              <section id="anleitung" className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      So funktioniert der Notenrechner
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Einfache und gewichtete Durchschnittsberechnung leicht verständlich erklärt
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      1
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                      Noten eintragen
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Trage deine Zensuren von 1,0 bis 6,0 ein. Dezimalkomma (z. B. 2,3) und Punkt (z. B. 2.3) werden beide automatisch erkannt.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      2
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                      Gewichtung wählen
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Aktiviere die &quot;Gewichtete Berechnung&quot;, wenn Hauptfächer doppelt oder Klausuren stärker als mündliche Leistungen zählen.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-3">
                      3
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1">
                      Ergebnis & Kopieren
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Erhalte deinen präzisen Schnitt mit verbaler Beurteilung (z. B. &quot;Gut&quot;) und kopiere das Ergebnis mit einem Klick in die Zwischenablage.
                    </p>
                  </div>
                </div>
              </section>

              {/* German grading scale table */}
              <section id="notensystem" className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      Das deutsche Schulnotensystem (1,0 bis 6,0)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Offizielle Notenstufen nach Beschluss der Kultusministerkonferenz (KMK)
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-semibold text-slate-500">
                        <th className="py-3 px-4">Notenstufe</th>
                        <th className="py-3 px-4">Bezeichnung</th>
                        <th className="py-3 px-4">Bedeutung & Definition</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="py-3 px-4 font-bold text-emerald-600">1,0 – 1,5</td>
                        <td className="py-3 px-4 font-semibold">Sehr gut</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die den Anforderungen in besonderem Maße entspricht.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-emerald-700">1,6 – 2,5</td>
                        <td className="py-3 px-4 font-semibold">Gut</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die den Anforderungen voll entspricht.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-blue-600">2,6 – 3,5</td>
                        <td className="py-3 px-4 font-semibold">Befriedigend</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die den Anforderungen im Allgemeinen entspricht.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-amber-600">3,6 – 4,0</td>
                        <td className="py-3 px-4 font-semibold">Ausreichend</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die zwar Mängel aufweist, aber den Anforderungen noch entspricht.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-orange-600">4,1 – 5,0</td>
                        <td className="py-3 px-4 font-semibold">Mangelhaft</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die den Anforderungen nicht entspricht, jedoch Grundkenntnisse erkennen lässt.</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-rose-600">5,1 – 6,0</td>
                        <td className="py-3 px-4 font-semibold">Ungenügend</td>
                        <td className="py-3 px-4 text-xs">Eine Leistung, die den Anforderungen nicht entspricht und bei der selbst Grundkenntnisse fehlen.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* FAQ Accordion */}
              <section id="faq" className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                      Häufig gestellte Fragen (FAQ)
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Antworten zur Rundung, Gewichtung und Datensicherheit
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <details className="group rounded-2xl border border-slate-200 dark:border-slate-700 p-4 open:bg-slate-50/50 dark:open:bg-slate-900/30 transition-all">
                    <summary className="font-semibold text-slate-800 dark:text-white text-sm cursor-pointer list-none flex items-center justify-between">
                      <span>Was ist der Unterschied zwischen einfachem und gewichtetem Notendurchschnitt?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                      Beim einfachen Notenschnitt zählt jede Note gleich viel (Summe aller Noten geteilt durch die Anzahl). Bei einer gewichteten Note fließt ein Fach mit der Gewichtung 2 doppelt so stark in den Gesamtschnitt ein wie ein Fach mit der Gewichtung 1 – typisch für Hauptfächer, Leistungskurse oder Klausuren im Vergleich zu mündlichen Noten.
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-slate-200 dark:border-slate-700 p-4 open:bg-slate-50/50 dark:open:bg-slate-900/30 transition-all">
                    <summary className="font-semibold text-slate-800 dark:text-white text-sm cursor-pointer list-none flex items-center justify-between">
                      <span>Werden meine Noten ohne Anmeldung gespeichert?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                      Nein! Wenn du den Rechner ohne Login nutzt, läuft die Berechnung zu 100% lokal in deinem Browser. Keine Eingabe wird an einen Server übertragen. Wenn du dich kostenlos anmeldest, kannst du Berechnungen und Notizen dauerhaft in deiner persönlichen Cloud speichern.
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-slate-200 dark:border-slate-700 p-4 open:bg-slate-50/50 dark:open:bg-slate-900/30 transition-all">
                    <summary className="font-semibold text-slate-800 dark:text-white text-sm cursor-pointer list-none flex items-center justify-between">
                      <span>Wie wird bei Zwischennoten gerundet?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                      NotenPilot rechnet intern mit dem exakten mathematischen Mittelwert und rundet das Endergebnis kaufmännisch auf zwei Nachkommastellen (z. B. 2,3333... wird zu 2,33). Einzelne Zwischenwerte werden nicht vorab gerundet, um höchste mathematische Genauigkeit zu gewährleisten.
                    </div>
                  </details>

                  <details className="group rounded-2xl border border-slate-200 dark:border-slate-700 p-4 open:bg-slate-50/50 dark:open:bg-slate-900/30 transition-all">
                    <summary className="font-semibold text-slate-800 dark:text-white text-sm cursor-pointer list-none flex items-center justify-between">
                      <span>Ist das Ergebnis meine offizielle Abschlussnote?</span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3">
                      Das berechnete Ergebnis dient als verlässliche Orientierung. Jede Schule, Hochschule oder Prüfungsordnung besitzt spezifische Verordnungen (z. B. Rundungsvorschriften oder Ausschlusskriterien bei bestimmten Unterkursen). Maßgeblich ist immer das offizielle Zeugnis deiner Schule oder Universität.
                    </div>
                  </details>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={handleNavigateTab}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView />
        )}

        {activeTab === 'subjects' && (
          <SubjectsView
            onOpenCalculator={() => handleNavigateTab('calculator')}
          />
        )}

        {activeTab === 'planner' && (
          <PlannerView />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView onRequireAuth={() => openAuth('login')} />
        )}

        {activeTab === 'timer' && (
          <FocusTimerView />
        )}
      </main>

      {/* Universal Footer */}
      <Footer onNavigateTab={(tab) => handleNavigateTab(tab as ActiveTab)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

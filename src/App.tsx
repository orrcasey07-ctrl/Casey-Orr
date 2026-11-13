import React, { useState } from 'react';
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
import { GrainzSphere } from './components/GrainzSphere';
import { InteractiveFeatureTabs } from './components/InteractiveFeatureTabs';
import { GrainzMarquee } from './components/GrainzMarquee';
import { GrainzFaqAccordion } from './components/GrainzFaqAccordion';
import {
  Calculator,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Flame,
  Target,
  FileSpreadsheet,
} from 'lucide-react';

const pathnameToTab = (pathname: string): ActiveTab => {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (clean === 'dashboard') return 'dashboard';
  if (clean === 'notes') return 'notes';
  if (clean === 'subjects') return 'subjects';
  if (clean === 'planner') return 'planner';
  if (clean === 'flashcards') return 'flashcards';
  if (clean === 'timer') return 'timer';
  return 'calculator';
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup' | 'forgot'>('login');

  const openAuth = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Sync initial URL path and popstate browser navigation
  React.useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/reset-password' || hash === '#reset-password') {
        openAuth('forgot');
      }

      const initialTab = pathnameToTab(path);
      setActiveTab(initialTab);

      if (hash && (hash === '#rechner-arena' || hash === '#funktionen' || hash === '#faq')) {
        setTimeout(() => {
          const el = document.getElementById(hash.substring(1));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    };

    handleLocation();

    const onPopState = () => {
      setActiveTab(pathnameToTab(window.location.pathname));
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigateTab = (tab: ActiveTab, updateHistory = true) => {
    setActiveTab(tab);
    if (updateHistory) {
      const targetPath = tab === 'calculator' ? '/' : `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    if (activeTab !== 'calculator') {
      setActiveTab('calculator');
      if (window.location.pathname !== '/') {
        window.history.pushState({ tab: 'calculator' }, '', '/');
      }
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090B0A] text-white font-sans selection:bg-[#C5F82A] selection:text-[#090B0A] relative">
      {/* Background radial atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(197,248,42,0.04),transparent_65%)]" />
        <div className="absolute top-[800px] -left-60 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015),transparent_70%)]" />
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        openAuthModal={() => openAuth('login')}
        onNavigateLandingSection={scrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'calculator' && (
          <div>
            {/* =========================================================================
                HERO SECTION — GRAINZ-INSPIRED WITH ANIMATED STIPPLED SPHERE & MASSIVE TYPO
                ========================================================================= */}
            <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                  
                  {/* Left Column: German Headline & Value Proposition */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    {/* Quiet Grainz Kicker */}
                    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#111412] border border-[#292F2B] text-xs font-mono text-[#A4AAA5]">
                      <span className="w-2 h-2 rounded-full bg-[#C5F82A] animate-pulse" />
                      <span className="text-white">NOTENPILOT 2026</span>
                      <span className="text-[#292F2B]">/</span>
                      <span>100% KOSTENLOS FÜR SCHÜLER</span>
                    </div>

                    {/* Massive Typography Inspired by GRAINZ */}
                    <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05]">
                      Deine Noten.<br />
                      Dein Überblick.<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#C5F82A]">
                        Deine Zukunft.
                      </span>
                    </h1>

                    {/* Supporting Description */}
                    <p className="text-base sm:text-lg text-[#A4AAA5] max-w-xl leading-relaxed">
                      Berechne deinen Notendurchschnitt, plane deine Ziele und behalte deine schulischen Leistungen immer im Blick – kostenlos mit NotenPilot.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => scrollToSection('rechner-arena')}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold text-sm sm:text-base shadow-xl shadow-[#C5F82A]/20 transition-all duration-300 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Jetzt Noten berechnen</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToSection('funktionen')}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#111412] hover:bg-[#171B18] text-white border border-[#292F2B] hover:border-[#A4AAA5] text-sm sm:text-base font-semibold transition-all duration-300 cursor-pointer"
                      >
                        <span>Funktionen entdecken</span>
                      </button>
                    </div>

                    {/* Unboxed Metadata Trust Bar */}
                    <div className="pt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-[#A4AAA5]/80">
                      <span>Deutsches Schulsystem 1,0–6,0</span>
                      <span aria-hidden="true">·</span>
                      <span>Oberstufe 0–15 Punkte</span>
                      <span aria-hidden="true">·</span>
                      <span>Keine Registrierung erforderlich</span>
                    </div>
                  </div>

                  {/* Right Column: Animated Stippled Particle Sphere (GRAINZ Signature Element) */}
                  <div className="lg:col-span-5 flex items-center justify-center relative">
                    <div className="w-full max-w-[460px] aspect-square relative flex items-center justify-center">
                      {/* Ambient lighting ring behind the particle sphere */}
                      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(197,248,42,0.06),transparent_70%)] pointer-events-none" />
                      
                      {/* Canvas 3D Stippled Particle Sphere */}
                      <GrainzSphere className="w-full h-full" />

                      {/* Floating Minimal Metric Chip */}
                      <div className="absolute bottom-6 left-6 p-3 rounded-2xl bg-[#111412]/90 backdrop-blur-md border border-[#292F2B] shadow-2xl flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A]">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#A4AAA5]">KMK Standard</div>
                          <div className="text-xs font-bold text-white">Präzise Rundung auf 2 Stellen</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* =========================================================================
                CONTINUOUS HORIZONTAL MARQUEE TICKER (GRAINZ STYLE)
                ========================================================================= */}
            <GrainzMarquee />

            {/* =========================================================================
                SECTION: EDITORIAL PROBLEM & SOLUTION
                ========================================================================= */}
            <section className="py-24 border-b border-[#292F2B]/60 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mb-14">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    PROBLEM &amp; LÖSUNG
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Schule kann kompliziert sein.<br />
                    Deine Noten müssen es nicht sein.
                  </h2>
                  <p className="text-base text-[#A4AAA5] mt-4 leading-relaxed">
                    Unübersichtliche Notenspiegel, unklare Gewichtungen zwischen mündlichen und schriftlichen Prüfungen sowie verstreute Lernnotizen kosten wertvolle Zeit.
                  </p>
                </div>

                {/* 3 Problem Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#A4AAA5] mb-6">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="text-xs font-mono text-[#A4AAA5] block mb-1">01 / PROBLEM</span>
                    <h3 className="text-lg font-bold text-white mb-2">Notenübersicht verlieren</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Zettelwirtschaft und unterschiedliche Gewichtungen in Haupt- und Nebenfächern machen es schwer, den echten Zeugnisschnitt vorherzusehen.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#A4AAA5] mb-6">
                      <Target className="w-5 h-5 text-rose-400" />
                    </div>
                    <span className="text-xs font-mono text-[#A4AAA5] block mb-1">02 / PROBLEM</span>
                    <h3 className="text-lg font-bold text-white mb-2">Zielnoten schwer einschätzen</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Vor der entscheidenden Schulaufgabe oder Klausur bleibt unklar, welche Mindestnote nötig ist, um die Versetzung oder den Wunschschnitt zu sichern.
                    </p>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#A4AAA5] mb-6">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-mono text-[#A4AAA5] block mb-1">03 / PROBLEM</span>
                    <h3 className="text-lg font-bold text-white mb-2">Lernorganisation wird unübersichtlich</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Klausurtermine, Zusammenfassungen, Vokabeln und Lernpausen laufen ohne System nebeneinander her und führen zu Last-Minute-Stress.
                    </p>
                  </div>
                </div>

                {/* NotenPilot Solution Banner */}
                <div className="mt-8 p-8 rounded-3xl bg-[#171B18] border border-[#292F2B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1 max-w-2xl">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A]">
                      DIE NOTENPILOT LÖSUNG
                    </span>
                    <h4 className="text-xl font-bold text-white">
                      Alles an einem sicheren, kostenlosen Ort
                    </h4>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Präzise Berechnungen im Browser ohne Zwangsanmeldung, kombiniert mit Cloud-Lernnotizen, digitaler Lernbox und Pomodoro Fokus-Timer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToSection('rechner-arena')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#090B0A] hover:bg-[#C5F82A] font-bold text-xs sm:text-sm transition-all duration-300 shrink-0 cursor-pointer"
                  >
                    <span>Rechner direkt starten</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* =========================================================================
                THE REAL FUNCTIONAL NOTENPILOT GRADE CALCULATOR (GRAINZ STYLED CONTAINER)
                ========================================================================= */}
            <section id="rechner-arena" className="py-24 border-b border-[#292F2B]/60 scroll-mt-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    INTERAKTIVES WERKZEUG
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Notendurchschnitt berechnen
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A4AAA5] mt-2">
                    Wähle dein Notensystem, trage deine Zensuren ein und berechne dein mathematisch exaktes Ergebnis.
                  </p>
                </div>

                {/* Render the full-fledged, real React GradeCalculator component */}
                <GradeCalculator
                  openAuthModal={() => openAuth('login')}
                  onSavedGradeSuccess={() => {
                    // Feedback handled in component
                  }}
                />
              </div>
            </section>

            {/* =========================================================================
                INTERACTIVE FEATURE TABS WITH REAL NOTENPILOT PRODUCT PREVIEWS
                ========================================================================= */}
            <section id="funktionen" className="py-24 border-b border-[#292F2B]/60 scroll-mt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-12">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    PRODUKT-SHOWCASE
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Entwickelt für deinen gesamten Lernprozess
                  </h2>
                  <p className="text-sm text-[#A4AAA5] mt-2">
                    Klicke durch die Reiter, um die Module von NotenPilot in Aktion zu sehen.
                  </p>
                </div>

                <InteractiveFeatureTabs
                  onSelectAction={(tabKey) => {
                    handleNavigateTab(tabKey as ActiveTab);
                  }}
                />
              </div>
            </section>

            {/* =========================================================================
                THREE-STEP PROCESS SECTION (GRAINZ INSPIRED)
                ========================================================================= */}
            <section className="py-24 border-b border-[#292F2B]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-14">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    SCHRITT FÜR SCHRITT
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    So einfach funktioniert NotenPilot.
                  </h2>
                  <p className="text-sm text-[#A4AAA5] mt-2">
                    In drei einfachen Schritten vom Notenchaos zu voller Transparenz und Klarheit.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {/* Step 1 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] relative group hover:border-[#C5F82A]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] text-white font-mono font-bold text-sm flex items-center justify-center mb-6 group-hover:border-[#C5F82A] group-hover:text-[#C5F82A] transition-colors">
                      01
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Noten eingeben</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Trage deine Schulnoten ein und behalte deine Ergebnisse im Blick. Komma (z. B. 2,3) und Punkt (z. B. 2.3) werden automatisch erkannt.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] relative group hover:border-[#C5F82A]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] text-white font-mono font-bold text-sm flex items-center justify-center mb-6 group-hover:border-[#C5F82A] group-hover:text-[#C5F82A] transition-colors">
                      02
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Durchschnitt berechnen</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Erhalte einen schnellen Überblick über deinen aktuellen Notendurchschnitt – exakt gewichtet und mit verbaler Beurteilung nach KMK-Skala.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] relative group hover:border-[#C5F82A]/50 transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-[#171B18] border border-[#292F2B] text-white font-mono font-bold text-sm flex items-center justify-center mb-6 group-hover:border-[#C5F82A] group-hover:text-[#C5F82A] transition-colors">
                      03
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Ziele planen</h3>
                    <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                      Behalte deine schulischen Ziele im Blick und plane deine nächsten Schritte mit dem Zielnoten-Rechner und dem Klausurenplaner.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                FEATURE CARDS GRID (6 PREMIUM GRAINZ CARDS)
                ========================================================================= */}
            <section className="py-24 border-b border-[#292F2B]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mb-14">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    FUNKTIONSÜBERSICHT
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Alle Werkzeuge für deinen Schulalltag
                  </h2>
                  <p className="text-sm text-[#A4AAA5] mt-2">
                    Präzise, werbefrei im Fokus und vollständig auf das deutsche Schulsystem abgestimmt.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">1. Notenrechner</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Klassische Schulnoten von 1,0 bis 6,0 mit beliebig vielen Fächern, Schnellauswahl deutscher Schulfächer und Noten-Reset.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToSection('rechner-arena')}
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-white group-hover:text-[#C5F82A] transition-colors cursor-pointer"
                    >
                      <span>Rechner öffnen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <Award className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">2. Notendurchschnitt</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Berechne einfaches oder gewichtetes arithmetisches Mittel mit kaufmännischer Rundung auf 2 Nachkommastellen nach KMK-Richtlinie.
                      </p>
                    </div>
                    <span className="mt-6 text-[11px] font-mono text-[#A4AAA5]/60">
                      Standardisierte Mittelwertformel
                    </span>
                  </div>

                  {/* Card 3 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">3. Zielnotenplanung</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Berechne präzise, welche Note in der nächsten Schulaufgabe geschrieben werden muss, um den angestrebten Wunschschnitt zu erreichen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToSection('rechner-arena')}
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-white group-hover:text-[#C5F82A] transition-colors cursor-pointer"
                    >
                      <span>Ziel berechnen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">4. Lernnotizen (Cloud)</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Erstelle und bearbeite Zusammenfassungen mit automatischer Speicherung, Fächerzuordnung, Anpinnfunktion und Live-Suche.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('notes')}
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-white group-hover:text-[#C5F82A] transition-colors cursor-pointer"
                    >
                      <span>Notizen ansehen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 5 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">5. Persönliches Dashboard</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Dein Schüler-Cockpit: Aktuelle Notenübersicht, anstehende Prüfungen im Countdown und schnelle Einsicht in deine jüngsten Notizen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('dashboard')}
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-white group-hover:text-[#C5F82A] transition-colors cursor-pointer"
                    >
                      <span>Dashboard öffnen</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 6 */}
                  <div className="p-8 rounded-3xl bg-[#111412] border border-[#292F2B] hover:border-[#A4AAA5] transition-all duration-300 group flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mb-6 group-hover:border-[#C5F82A] transition-colors">
                        <Clock className="w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">6. Lernorganisation &amp; Timer</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed">
                        Verbinde Klausur-Countdowns mit interaktiven Karteikarten-Flips und dem 25-Minuten Pomodoro-Fokustimer mit Web Audio Signal.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('timer')}
                      className="mt-6 inline-flex items-center gap-1.5 text-xs font-mono text-white group-hover:text-[#C5F82A] transition-colors cursor-pointer"
                    >
                      <span>Timer starten</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                BENEFITS & TRUST SECTION
                ========================================================================= */}
            <section className="py-24 border-b border-[#292F2B]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-6 space-y-6">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block">
                      DEIN VORTEIL
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                      Alles Wichtige für deinen Schulalltag an einem Ort.
                    </h2>
                    <p className="text-sm sm:text-base text-[#A4AAA5] leading-relaxed">
                      NotenPilot wurde geschaffen, um Schülern und Studierenden in Deutschland ein transparentes, sicheres und werbefrei-ruhiges Lernwerkzeug an die Hand zu geben.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-2xl bg-[#111412] border border-[#292F2B]">
                        <h4 className="font-bold text-white text-sm mb-1">Einfache Bedienung</h4>
                        <p className="text-xs text-[#A4AAA5] leading-relaxed">
                          Keine komplizierten Tabellen oder Makros. Trage Noten mit Komma oder Punkt ein.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111412] border border-[#292F2B]">
                        <h4 className="font-bold text-white text-sm mb-1">Klare Notenberechnung</h4>
                        <p className="text-xs text-[#A4AAA5] leading-relaxed">
                          Volle Transparenz über Gewichtungen, Zwischennoten und KMK-Notenstufen.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111412] border border-[#292F2B]">
                        <h4 className="font-bold text-white text-sm mb-1">Organisierte Notizen</h4>
                        <p className="text-xs text-[#A4AAA5] leading-relaxed">
                          Fächergebundene Mitschriften mit automatischer Cloud-Sicherung.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#111412] border border-[#292F2B]">
                        <h4 className="font-bold text-white text-sm mb-1">Klare Benutzeroberfläche</h4>
                        <p className="text-xs text-[#A4AAA5] leading-relaxed">
                          Fokusiertes GRAINZ-Monochrom-Design ohne störende Ablenkungen.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="p-8 sm:p-10 rounded-3xl bg-[#111412] border border-[#292F2B] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(197,248,42,0.06),transparent_70%)] pointer-events-none" />
                      <div className="flex items-center gap-2 text-xs font-mono text-[#C5F82A] mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        <span>DSGVO-KONFORM &amp; SICHER</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        Datenschutz an erster Stelle
                      </h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] leading-relaxed mb-6">
                        Im Gast-Modus verlassen deine Noten niemals deinen eigenen Browser. Wenn du dich registrierst, schützt Row Level Security deine Daten vor unbefugtem Zugriff.
                      </p>
                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#171B18] border border-[#292F2B]">
                          <span className="text-white">Gast-Berechnung</span>
                          <span className="text-[#C5F82A]">100% lokal im Browser</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#171B18] border border-[#292F2B]">
                          <span className="text-white">Cloud-Datenbank</span>
                          <span className="text-emerald-400">TLS &amp; RLS geschützt</span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#171B18] border border-[#292F2B]">
                          <span className="text-white">Hosting</span>
                          <span className="text-[#A4AAA5]">Ausfallsicheres CDN</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                PRICING / FREE ACCESS SECTION
                ========================================================================= */}
            <section className="py-24 border-b border-[#292F2B]/60">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    TRANSPARENZ
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Starte kostenlos mit NotenPilot.
                  </h2>
                  <p className="text-sm text-[#A4AAA5] mt-2">
                    Keine versteckten Gebühren. Alle Kernfunktionen sind für Schülerinnen und Schüler frei nutzbar.
                  </p>
                </div>

                {/* Free Access Card */}
                <div className="p-8 sm:p-12 rounded-3xl bg-[#111412] border border-[#292F2B] relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(197,248,42,0.08),transparent_70%)] pointer-events-none" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#292F2B]">
                    <div>
                      <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-[#090B0A] bg-[#C5F82A] px-2.5 py-0.5 rounded-md mb-2">
                        KOSTENLOSER ZUGANG
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">Schüler- &amp; Abitur-Paket</h3>
                      <p className="text-xs sm:text-sm text-[#A4AAA5] mt-1">
                        Dauerhaft frei für alle Schülerinnen, Schüler und Studierenden.
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-4xl sm:text-5xl font-black text-white font-mono">0 €</div>
                      <span className="text-xs text-[#A4AAA5] font-mono">Keine Kreditkarte nötig</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 text-xs sm:text-sm text-[#A4AAA5]">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Unbegrenzte Notenberechnungen (1,0–6,0)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Gymnasiale Oberstufe (0–15 Punkte)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Zielnoten- &amp; Klausurrechner</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Lernnotizen mit Debounced Cloud-Save</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Klausurenplaner mit Tages-Countdowns</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#C5F82A] shrink-0" />
                      <span className="text-white">Digitale Karteikarten &amp; Pomodoro-Timer</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openAuth('signup')}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold text-sm shadow-xl shadow-[#C5F82A]/20 transition-all duration-300 cursor-pointer"
                    >
                      <span>Kostenlos starten</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                FAQ ACCORDION SECTION
                ========================================================================= */}
            <section id="faq" className="py-24 border-b border-[#292F2B]/60 scroll-mt-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block mb-2">
                    FRAGEN &amp; ANTWORTEN
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Häufig gestellte Fragen (FAQ)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A4AAA5] mt-2">
                    Transparente Antworten zur Berechnung, Sicherheit und Speicherung.
                  </p>
                </div>

                <GrainzFaqAccordion />
              </div>
            </section>

            {/* =========================================================================
                ADSENSE-READY COMPLIANT BANNER PLACEHOLDER
                ========================================================================= */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
              <div
                id="werbung-placeholder"
                className="rounded-2xl border border-dashed border-[#292F2B] bg-[#111412]/50 p-6 text-center text-xs text-[#A4AAA5]/60"
                aria-label="Werbebereich"
              >
                <div className="font-mono uppercase tracking-wider text-[10px] text-[#A4AAA5] mb-1">
                  Anzeige / Werbeplatz
                </div>
                <p className="max-w-md mx-auto text-[11px] leading-relaxed">
                  Dieser Platzhalter ist für Google AdSense reserviert. Transparente, nicht-irreführende Werbeeinblendungen zur dauerhaften Finanzierung des kostenlosen Schülerangebots.
                </p>
              </div>
            </div>

            {/* =========================================================================
                FINAL CTA SECTION (GRAINZ STYLE)
                ========================================================================= */}
            <section className="py-28 relative overflow-hidden">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#C5F82A] block">
                  BEREIT FÜR BESSERE NOTEN?
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                  Mach mehr aus deinem Schulalltag.
                </h2>
                <p className="text-base sm:text-lg text-[#A4AAA5] max-w-xl mx-auto leading-relaxed">
                  Berechne deine Noten, organisiere deine Lernnotizen und behalte deine Ziele im Blick.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => openAuth('signup')}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold text-base shadow-2xl shadow-[#C5F82A]/30 transition-all duration-300 cursor-pointer"
                  >
                    <span>Jetzt kostenlos starten</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('rechner-arena')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#111412] hover:bg-[#171B18] text-white border border-[#292F2B] font-semibold text-base transition-all duration-300 cursor-pointer"
                  >
                    <span>Ohne Anmeldung rechnen</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Authenticated / Student Portal Views */}
        {activeTab !== 'calculator' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            {!user && ['dashboard', 'notes', 'subjects', 'planner'].includes(activeTab) ? (
              <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-[#111412] border border-[#292F2B] text-center shadow-2xl space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#171B18] border border-[#292F2B] flex items-center justify-center text-[#C5F82A] mx-auto shadow-lg">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#C5F82A] uppercase block mb-1">
                    GESCHÜTZTER SCHÜLERBEREICH
                  </span>
                  <h3 className="text-2xl font-bold text-white">
                    Anmeldung erforderlich
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A4AAA5] mt-2 leading-relaxed">
                    Um auf dein persönliches Dashboard, deine Fächer, Notenspiegel, Prüfungen und Cloud-Notizen zuzugreifen, melde dich bitte an.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C5F82A] hover:bg-white text-[#090B0A] font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-[#C5F82A]/20"
                  >
                    <span>Jetzt anmelden</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigateTab('calculator')}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#171B18] hover:bg-[#202521] text-white border border-[#292F2B] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    <span>Zum Notenrechner</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardView setActiveTab={handleNavigateTab} />}
                {activeTab === 'notes' && <NotesView />}
                {activeTab === 'subjects' && <SubjectsView onOpenCalculator={() => handleNavigateTab('calculator')} />}
                {activeTab === 'planner' && <PlannerView />}
                {activeTab === 'flashcards' && <FlashcardsView onRequireAuth={() => openAuth('login')} />}
                {activeTab === 'timer' && <FocusTimerView />}
              </>
            )}
          </div>
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
